import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Analytics } from './entities/analytics.entity';
import { Sequelize } from 'sequelize-typescript';
import { fn, col, Op, literal, QueryTypes } from 'sequelize';
import { TrackPageViewDto } from './dto/analytics.dto';
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Analytics)
        private model: typeof Analytics,
        private sequelize: Sequelize,
    ) { }

    private readonly sessionDuration = 30 * 60 * 1000;
    private readonly excludedPaths = [
        '/favicon.ico',
        '/robots.txt',
        '/sitemap.xml',
        '/api/',
        '/admin/',
        '/static/',
        '/assets/',
        '/css/',
        '/js/',
        '/images/',
    ];
    private readonly excludedExtensions = [
        '.js', '.css', '.png', '.jpg', '.jpeg', '.gif',
        '.ico', '.svg', '.woff', '.woff2', '.ttf', '.map'
    ];

    private shouldTrack(page: string): boolean {
        if (this.excludedPaths.some(excluded => page.startsWith(excluded))) {
            return false;
        }

        if (this.excludedExtensions.some(ext => page.endsWith(ext))) {
            return false;
        }

        return true;
    }

    async trackPageView(trackDto: TrackPageViewDto) {
        let sessionId = trackDto.sessionId;
        let isNew = false;

        if (!sessionId) {
            sessionId = uuidv4();
            isNew = true;
        }

        if (!this.shouldTrack(trackDto.page)) {
            return { sessionId, isNew };
        }

        try {
            const lastVisit = await this.model.findOne({
                where: {
                    sessionId,
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - this.sessionDuration),
                    },
                },
                order: [["createdAt", "DESC"]],
            });

            if (!lastVisit || lastVisit.page !== trackDto.page) {
                await this.model.create({
                    ip: trackDto.ip,
                    userAgent: trackDto.userAgent,
                    page: trackDto.page,
                    sessionId,
                });
            } else {
                await lastVisit.update({
                    updatedAt: new Date(),
                });
            }
        } catch (error) {
            console.error("Analytics tracking error:", error);
        }

        return { sessionId, isNew };
    }

    async getVisitorsCount() {
        return this.model.count({
            distinct: true,
            col: 'sessionId'
        });
    }

    async getViewsByPeriod() {
        const now = new Date();

        const periods = {
            day: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        };

        const results: Record<string, number> = {};

        for (const [label, startDate] of Object.entries(periods)) {
            const count = await this.model.count({
                distinct: true,
                col: "sessionId",
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                    },
                },
            });

            results[label] = count;
        }

        return results;
    }


    async getUniqueVisitors(startDate: string = '2024-01-01'): Promise<object> {
        const [result] = await this.model.sequelize.query<{ unique_visitors: string }[]>(
            `SELECT COUNT(DISTINCT CONCAT(ip, '-', "userAgent")) as unique_visitors
     FROM ${this.model.tableName}
     WHERE "visitedAt" >= :startDate`,
            {
                replacements: { startDate },
                type: QueryTypes.SELECT,
            }
        );

        return result;
    }

    async getUniqueVisitorsByPeriod() {
        const now = new Date();

        const periods = {
            day: new Date(now.getTime() - 24 * 60 * 60 * 1000),        // آخر يوم
            week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),   // آخر أسبوع
            month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // آخر شهر
        };

        const results: Record<string, number> = {};

        for (const [label, startDate] of Object.entries(periods)) {
            const [result] = await this.model.sequelize.query<{ unique_visitors: string | null }>(
                `
  SELECT COALESCE(COUNT(DISTINCT CONCAT(ip, '-', "userAgent")), 0) AS unique_visitors
  FROM ${this.model.tableName}
  WHERE "visitedAt" >= :startDate
  `,
                {
                    replacements: { startDate },
                    type: QueryTypes.SELECT,
                }
            );

            results[label] = Number(result?.unique_visitors ?? 0);
        }

        return results;
    }



    async getPageViews() {
        return this.model.findAll({
            attributes: [
                'page',
                [fn('COUNT', col('*')), 'views'] // Changed from col('page') to col('*')
            ],
            group: ['page'],
            order: [[literal('views'), 'DESC']], // Add ordering
            raw: true,
        });
    }

    async getDevices() {
        return this.model.findAll({
            attributes: [
                'userAgent',
                // [fn('COUNT', col('*')), 'count'], // Changed from col('userAgent') to col('*')
                [fn('COUNT', fn('DISTINCT', col('sessionId'))), 'count'],
            ],
            group: ['userAgent'],
            order: [[literal('count'), 'DESC']], // Add ordering for consistency
            raw: true,
        });
    }

    // 🟢 Top pages by traffic
    async getTopPages(limit = 5) {
        return this.model.findAll({
            attributes: [
                'page',
                [fn('COUNT', col('*')), 'views'] // Changed from col('page') to col('*')
            ],
            group: ['page'],
            order: [[literal('views'), 'DESC']],
            limit,
            raw: true,
        });
    }

    // 🟢 Bounce rate (1 page per session = bounced)
    // ⚠ Needs session tracking; here just example assuming page count per IP
    // async getBounceRate() {
    //     const totalUniqueVisitors = await this.getUniqueVisitors();

    //     const bouncedVisitors = await this.model.findAll({
    //         attributes: [
    //             'ip',
    //             [fn('COUNT', col('*')), 'page_count']
    //         ],
    //         group: ['sessionId'],
    //         having: literal('COUNT(*) = 1'),
    //         raw: true
    //     });

    //     return totalUniqueVisitors > 0
    //         ? (bouncedVisitors.length / totalUniqueVisitors) * 100
    //         : 0;
    // }
}
