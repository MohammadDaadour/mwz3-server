import { BadRequestException, Injectable } from '@nestjs/common';
import { AdDto, CreateAdDto, UpdateAdDto } from './entities/ad.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes, fn, where, col, cast } from 'sequelize';
import { Ad } from './entities/ad.entity';
import { Sequelize } from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { State } from 'src/state/entities/state.entity';
import { UsersService } from 'src/users/users.service';
import { Category } from 'src/categories/entities/category.entity';
import { Area } from 'src/areas/entities/area.entity';
import { ReqJwt } from 'src/auth/interfaces/reqUser.interface';
import { SubsService } from 'src/subs/subs.service';
import { BoostPlan } from './entities/ad.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AdsService {
  constructor(
    @InjectModel(Ad)
    private model: typeof Ad,
    private userService: UsersService,
    private subsService: SubsService,
    private sql: Sequelize,
  ) { }

  async getCount(ctg: number) {
    const rawCtgArray = await this.sql.query(
      `WITH RECURSIVE descendants AS ( SELECT id, parent FROM categories WHERE id = $1 UNION ALL SELECT e.id, e.parent FROM categories e INNER JOIN descendants s ON s.id = e.parent ) SELECT id FROM descendants;`,
      { bind: [ctg], type: QueryTypes.SELECT },
    );
    const ctgArray = rawCtgArray.map((item: { id: number }) => item.id);

    const result = await this.model.count({
      where: { categoryFK: { [Op.in]: ctgArray }, stateFK: 5 },
    });
    return result;
  }

  async getFavs(id: number) {
    const user = await this.userService.findById(id);
    const favsArray = user.favs;
    const result = await this.model.findAndCountAll({
      attributes: { exclude: ['searchVector'] },
      where: { id: { [Op.in]: favsArray } },
      include: [
        {
          model: User,
          required: true,
          attributes: ['id', 'label', 'image', 'certified', 'phone', 'type'],
        },
        { model: State, required: true, where: { id: 5 } },
      ],
      order: [['activatedAt', 'DESC']],
    });
    return result;
  }

  async getOwned(userId: number, page: number) {
    const results = await this.model.findAndCountAll({
      attributes: { exclude: ['searchVector'] },
      include: [
        {
          model: User,
          required: true,
          where: { id: userId },
          attributes: ['id', 'label', 'image', 'phone', 'certified', 'type'],
        },
        { model: State, required: true },
      ],
      order: [['createdAt', 'DESC']],
      limit: 15,
      offset: (page - 1) * 15,
    });
    return results;
  }

  async getByUser(userId: number) {
    const results = await this.model.findAndCountAll({
      attributes: { exclude: ['searchVector'] },
      include: [
        {
          model: User,
          required: true,
          where: { id: userId },
          attributes: ['id', 'label', 'image', 'phone', 'certified', 'type'],
        },
        { model: State, required: true, where: { id: 5 } },
      ],
      order: [['createdAt', 'DESC']],
    });
    return results;
  }

  async getFiltered(
    limit: number,
    page: number,
    area?: number,
    category?: number,
    query?: string,
    boosted?: boolean,
    certified?: boolean,
  ) {
    const getBoostedFilter = async () => {
      if (boosted) {
        const boostedFilter = { boosted: { [Op.is]: true } };
        return boostedFilter;
      } else return null;
    };

    // \\


    const getCertifiedFilter = async () => {
      if (certified) {
        const certifiedFilter = { certified: { [Op.is]: true } };
        return certifiedFilter;
      } else return null;
    };

    const getAreaProp = async () => {
      if (area) {
        const rawAreaArray = await this.sql.query(
          'WITH RECURSIVE descendants AS ( SELECT id, parent FROM areas WHERE id = $1 UNION ALL SELECT e.id, e.parent FROM areas e INNER JOIN descendants s ON s.id = e.parent ) SELECT id FROM descendants;',
          { bind: [area], type: QueryTypes.SELECT },
        );
        const areaArray = rawAreaArray.map((item: { id: number }) => item.id);
        const areaProp = { areaFK: { [Op.in]: areaArray } };
        return areaProp;
      } else return null;
    };

    const getCtgProp = async () => {
      if (category) {
        const rawCtgArray = await this.sql.query(
          `WITH RECURSIVE descendants AS ( SELECT id, parent FROM categories WHERE id = $1 UNION ALL SELECT e.id, e.parent FROM categories e INNER JOIN descendants s ON s.id = e.parent ) SELECT id FROM descendants;`,
          { bind: [category], type: QueryTypes.SELECT },
        );
        const ctgArray = rawCtgArray.map((item: { id: number }) => item.id);
        const categoryProp = { categoryFK: { [Op.in]: ctgArray } };
        return categoryProp;
      } else return null;
    };

    // const getQueryProp = async () => {
    //   const base = query
    //     ? query
    //       .trim()
    //       .replace(/[^\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9 ]/g, '')
    //       .replace(/\s+/g, ' ')
    //     : false;
    //   if (base) {
    //     const pt1 = base.replace(/\s+/g, ' & ');
    //     const pt2 = base
    //       .replace(/[\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9]+/g, '$&:*')
    //       .replace(/\s+/g, ' & ');
    //     const pt3 = base.replace(/\s+/g, ' | ');
    //     const queryStr = pt1 + ' | ' + pt2 + ' | ' + pt3;
    //     const queryProp = {
    //       searchVector: { [Op.match]: fn('to_tsquery', queryStr) },
    //     };
    //     return queryProp;
    //   } else return null;
    // };

    const getQueryProp = async () => {
      let base = query
        ? query
          .trim()
          .replace(/[^\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9 ]/g, '')
          .replace(/\s+/g, ' ')
        : '';

      if (!base) return null;

      const words = base.split(' ').filter(Boolean);

      if (words.length === 0) return null;

      const tsParts = [
        ...words.slice(0, -1).map(w => w),
        `${words[words.length - 1]}:*`
      ];

      const queryStr = tsParts.join(' & ');

      return {
        searchVector: {
          [Op.match]: fn('to_tsquery', 'arabic', queryStr)
        }
      };
    };

    const areaProp = await getAreaProp();
    const categoryProp = await getCtgProp();
    const queryProp = await getQueryProp();
    const boostedFilter = await getBoostedFilter();
    const certifiedFilter = await getCertifiedFilter();

    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    const ts = new Date();

    const results = await this.model.findAndCountAll({
      attributes: { exclude: ['searchVector'] },
      where: {
        ...areaProp,
        ...categoryProp,
        ...queryProp,
        ...boostedFilter,
        // activatedAt: { [Op.gte]: ts.setDate(ts.getDate() - 121) },
        activatedAt: { [Op.ne]: null },
      },
      include: [
        {
          model: User,
          required: true,
          where: { ...certifiedFilter },
          attributes: ['id', 'label', 'image', 'certified', 'phone', 'type'],
        },
        { model: State, required: true, where: { id: 5 } },
      ],
      order: [
        ['boosted', 'DESC'],
        ['activatedAt', 'DESC'],
      ],
      limit: limit,
      offset: (page - 1) * limit,
    });
    return results;
  }

  async getBoostedAds(limit: number = 15, page: number = 1) {
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    const ts = new Date();

    const results = await this.model.findAndCountAll({
      attributes: { exclude: ['searchVector'] },
      where: {
        boosted: true,
        // activatedAt: { [Op.gte]: ts.setDate(ts.getDate() - 121) },
        activatedAt: { [Op.ne]: null },
      },
      include: [
        {
          model: User,
          required: true,
          attributes: ['id', 'label', 'image', 'certified', 'phone', 'type'],
        },
        { model: State, required: true, where: { id: 5 } },
      ],
      order: [
        ['activatedAt', 'DESC'],
      ],
      limit: limit,
      offset: (page - 1) * limit,
    });

    return results;
  }

  async findAllIncl(page: number, query?: string, user?: string) {
    const getQueryProp = () => {
      if (query) {
        return {
          [Op.or]: [
            where(cast(col('Ad.id'), 'varchar'), { [Op.like]: `%${query}%` }),
            { label: { [Op.like]: `%${query}%` } },
          ],
        };
      } else return null;
    };

    return await this.model.findAndCountAll({
      where: { ...getQueryProp() },
      attributes: { exclude: ['searchVector'] },
      include: [User, State, Category, Area],
      order: [['createdAt', 'DESC']],
      paranoid: false,
      limit: 15,
      offset: (page - 1) * 15,
    });
  }


  async findOnePublic(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ad ID');
    }

    return await this.model.findOne({
      attributes: { exclude: ['searchVector'] },
      where: { id: id, stateFK: 5 },
      include: [User, State, Category, Area],
    });
  }

  async findOnePrivate(ad: number, user: number) {
    return await this.model.findOne({
      attributes: { exclude: ['searchVector'] },
      where: { id: ad, userFK: user },
      include: [User, State, Category, Area],
    });
  }

  async findById(id: number) {
    return await this.model.findByPk(id);
  }

  async findByIdIncl(id: number) {
    return await this.model.findByPk(id, {
      paranoid: false,
      include: [User, State, Category, Area],
    });
  }

  async findOneParams({ ...dto }: AdDto) {
    return await this.model.findOne({ where: { ...dto } });
  }

  async create(dto: CreateAdDto) {
    const record = this.model.build({ ...dto });
    return await record.save();
  }

  async update(id: number, dto: UpdateAdDto) {
    const record = await this.model.findByPk(id, { include: { model: User, attributes: ['id'] } });
    // let timeStamp = new Date()
    // console.log('=======================================')
    // console.log('dto ',dto)
    // console.log('user', record.user.id)
    // const subs = await this.subsService.findByUser(record.user.id)
    // if (dto.boosted) {
    //   console.log('boosting')
    //   let sub = subs.filter(item => item.subType.type === 'boost' && item.active)[0]
    //   console.log('starts: ', sub.activatedAt,' end: ', sub.endsAt)
    //   console.log(sub.activatedAt < timeStamp && timeStamp < sub.endsAt)
    // }
    // if (dto.stateFK === 5) {
    //   console.log('publishing')
    //   let sub = subs.filter(item => item.subType.type === 'ads' && item.active)[0]
    //   console.log('starts: ', sub.activatedAt,' end: ', sub.endsAt)
    // }

    // console.log('=======================================')
    const modd = await record?.update({ ...dto });
    return await modd?.save();
  }

  async updateIncl(id: number, dto: UpdateAdDto) {
    const record = await this.model.findByPk(id, { paranoid: false });
    const modd = await record?.update({ ...dto });
    return await modd?.save();
  }

  async remove(id: number) {
    return await this.model.destroy({ where: { id } });
  }

  async restore(id: number) {
    return await this.model.restore({ where: { id } });
  }

  async incVisits(id: number) {
    await this.model.increment({ visits: 1 }, { where: { id: id } });
  }


  async getSupermarketProducts(
    limit: number = 15,
    page: number = 1,
    area?: number,
    query?: string,
    boosted?: boolean,
    certified?: boolean,
  ) {
    // First, find the supermarket category ID
    const supermarketCategory = await this.sql.query(
      `SELECT id FROM categories WHERE "labelEn" = 'supermarket' LIMIT 1;`,
      { type: QueryTypes.SELECT },
    );

    if (!supermarketCategory || supermarketCategory.length === 0) {
      throw new BadRequestException('Supermarket category not found');
    }

    const supermarketId = (supermarketCategory[0] as { id: number }).id;

    // Get all descendant categories
    const rawCtgArray = await this.sql.query(
      `WITH RECURSIVE descendants AS (
        SELECT id, parent FROM categories WHERE id = $1
        UNION ALL
        SELECT e.id, e.parent FROM categories e
        INNER JOIN descendants s ON s.id = e.parent
      ) SELECT id FROM descendants;`,
      { bind: [supermarketId], type: QueryTypes.SELECT },
    );

    const ctgArray = rawCtgArray.map((item: { id: number }) => item.id);

    // Handle area filtering like in getFiltered method
    const getAreaProp = async () => {
      if (area) {
        const rawAreaArray = await this.sql.query(
          'WITH RECURSIVE descendants AS (SELECT id, parent FROM areas WHERE id = $1 UNION ALL SELECT e.id, e.parent FROM areas e INNER JOIN descendants s ON s.id = e.parent) SELECT id FROM descendants;',
          { bind: [area], type: QueryTypes.SELECT },
        );
        const areaArray = rawAreaArray.map((item: { id: number }) => item.id);
        return { areaFK: { [Op.in]: areaArray } };
      } else return null;
    };

    // Handle query filtering like in getFiltered method
    const getQueryProp = async () => {
      const base = query
        ? query
          .trim()
          .replace(/[^\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9 ]/g, '')
          .replace(/\s+/g, ' ')
        : false;
      if (base) {
        const pt1 = base.replace(/\s+/g, ' & ');
        const pt2 = base
          .replace(/[\u0041-\u005A\u0061-\u007A\u0620-\u064A0-9]+/g, '$&:*')
          .replace(/\s+/g, ' & ');
        const pt3 = base.replace(/\s+/g, ' | ');
        const queryStr = pt1 + ' | ' + pt2 + ' | ' + pt3;
        return {
          searchVector: { [Op.match]: fn('to_tsquery', queryStr) },
        };
      } else return null;
    };

    // Handle boosted filtering
    const getBoostedFilter = async () => {
      if (boosted) {
        return { boosted: { [Op.is]: true } };
      } else return null;
    };

    // Handle certified filtering
    const getCertifiedFilter = async () => {
      if (certified) {
        return { certified: { [Op.is]: true } };
      } else return null;
    };

    // Get all the filter properties
    const areaProp = await getAreaProp();
    const queryProp = await getQueryProp();
    const boostedFilter = await getBoostedFilter();
    const certifiedFilter = await getCertifiedFilter();

    // Ensure valid page number
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    // Get ads that are not older than 121 days
    const ts = new Date();

    // Find all ads that belong to supermarket categories
    const results = await this.model.findAndCountAll({
      attributes: { exclude: ['searchVector'] },
      where: {
        categoryFK: { [Op.in]: ctgArray },
        ...areaProp,
        ...queryProp,
        ...boostedFilter,
        // activatedAt: { [Op.gte]: ts.setDate(ts.getDate() - 121) },
        activatedAt: { [Op.ne]: null },
      },
      include: [
        {
          model: User,
          required: true,
          where: { ...certifiedFilter },
          attributes: ['id', 'label', 'image', 'certified', 'phone', 'type'],
        },
        { model: State, required: true, where: { id: 5 } }, // Only active ads
      ],
      order: [
        ['boosted', 'DESC'],
        ['activatedAt', 'DESC'],
      ],
      limit: limit,
      offset: (page - 1) * limit,
    });

    return results;
  }

  async requestBoost(adId: number, userId: number, plan: BoostPlan) {
    // تأكد إن الإعلان موجود
    const ad = await this.model.findOne({
      where: { id: adId, userFK: userId },
    });

    if (!ad) {
      throw new BadRequestException('Ad not found or not owned by user');
    }

    if (ad.boosted) {
      throw new BadRequestException('Ad is already boosted');
    }

    if (ad.boost_request) {
      throw new BadRequestException('Boost request already pending');
    }

    // تحديث بيانات الترويج
    ad.boost_request = true;
    ad.boost_plan = plan; // enum value زي (BoostPlan.ONE_DAY)
    await ad.save();

    return {
      message: 'Boost request submitted successfully',
      adId: ad.id,
      plan: ad.boost_plan,
    };
  }

  async approveBoost(adId: number) {
    const ad = await this.model.findByPk(adId);

    if (!ad) {
      throw new BadRequestException('Ad not found');
    }

    if (!ad.boost_request || !ad.boost_plan) {
      throw new BadRequestException('No boost request pending for this ad');
    }

    // نحدد المدة حسب البلان
    const now = new Date();
    let durationDays = 0;

    switch (ad.boost_plan) {
      case 'ONE_DAY':
        durationDays = 1;
        break;
      case 'THREE_DAYS':
        durationDays = 3;
        break;
      case 'WEEK':
        durationDays = 7;
        break;
      default:
        throw new BadRequestException('Invalid boost plan');
    }

    const endDate = new Date(now);
    endDate.setDate(now.getDate() + durationDays);

    ad.boosted = true;
    ad.boost_request = false;
    ad.boost_start = now;
    ad.boost_end = endDate;

    await ad.save();

    return {
      message: 'Boost approved successfully',
      adId: ad.id,
      plan: ad.boost_plan,
      boost_start: ad.boost_start,
      boost_end: ad.boost_end,
    };
  }

  async rejectBoost(adId: number) {
    const ad = await this.model.findByPk(adId);

    if (!ad) {
      throw new BadRequestException('Ad not found');
    }

    // if (!ad.boost_request || !ad.boost_plan) {
    //   throw new BadRequestException('No boost request pending for this ad');
    // }

    // إلغاء طلب الترويج
    ad.boost_request = false;
    ad.boosted = false;
    ad.boost_plan = null;
    ad.boost_start = null;
    ad.boost_end = null;

    await ad.save();

    return {
      message: 'Boost request rejected successfully',
      adId: ad.id,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async expireBoosts() {
    const now = new Date();

    const allBoostedAds = await this.model.findAll({
      where: {
        boosted: true,
        boost_end: { [Op.not]: null }
      },
      attributes: ['id', 'boost_end'],
      logging: false // نخفي الـ SQL عشان منشوشش
    });

    const expiredAds = await this.model.findAll({
      where: {
        boosted: true,
        boost_end: {
          [Op.lte]: now,
          [Op.not]: null
        }
      },
      logging: false
    });

    for (const ad of expiredAds) {

      await ad.update({
        boosted: false,
        boost_request: false,
        boost_plan: null,
        boost_start: null,
        boost_end: null
      });
    }
  }

  async getBoostRequests(limit: number, page: number) {
    if (!Number.isInteger(page) || page < 1) {
      page = 1;
    }

    const results = await this.model.findAndCountAll({
      where: { boost_request: { [Op.is]: true } },
      include: [
        {
          model: User,
          required: true,
          attributes: ["id", "label", "image", "certified", "phone", "type"],
        },
        { model: State, required: true, where: { id: 5 } },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return results;
  }

}
