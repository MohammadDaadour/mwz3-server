import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';
import { Transaction, Sequelize } from 'sequelize';
import { InjectConnection } from '@nestjs/sequelize';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart) private cartModel: typeof Cart,
    @InjectModel(CartItem) private cartItemModel: typeof CartItem,
    @InjectModel(Ad) private adModel: typeof Ad,
    @InjectModel(User) private userModel: typeof User,
    @InjectConnection() private sequelize: Sequelize
  ) { }

  async getCart(userId: number, transaction?: Transaction): Promise<Cart> {
    const user = await this.userModel.findByPk(userId, { transaction });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    // 1. Find or create cart without includes
    const [cart] = await this.cartModel.findOrCreate({
      where: { userId },
      defaults: { userId },
      transaction
    });

    // 2. Load cart with items separately
    return this.cartModel.findByPk(cart.id, {
      include: [{
        model: CartItem,
        include: [{
          model: Ad,
          attributes: ['id', 'label', 'value', 'image']
        }]
      }],
      transaction
    }) as Promise<Cart>;
  }

  async checkProductExists(productId: number) {
    const product = await this.adModel.findByPk(productId);
    if (!product) {
      return null;
    }

    // Return basic product info needed for cart using correct field names
    return {
      id: product.id,
      title: product.label,
      value: product.value,
      image: product.image
    };
  }

  async addItem(userId: number, ad_id: number, quantity: number): Promise<Cart> {
    const transaction = await this.sequelize.transaction();
    try {
      if (quantity <= 0) throw new BadRequestException('Quantity must be > 0');
  
      // 1. Get/Create cart WITHIN transaction
      const cart = await this.cartModel.findOrCreate({
        where: { userId },
        defaults: { userId },
        transaction
      }).then(([cart]) => cart);
  
      // 2. Verify ad exists WITHIN transaction
      const ad = await this.adModel.findByPk(ad_id, { transaction });
      if (!ad) throw new NotFoundException('Product not found');
  
      // 3. Find or create cart item
      const [cartItem] = await this.cartItemModel.findOrCreate({
        where: { cartId: cart.id, adId: ad_id },
        defaults: {
          quantity: quantity,
          price: ad.value
        },
        transaction
      });
  
      // 4. Update quantity if existing item
      if (!cartItem.isNewRecord) {
        cartItem.quantity += quantity;
        await cartItem.save({ transaction });
      }
  
      await transaction.commit();
      return this.getCart(userId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removeItem(userId: number, cartItemId: number): Promise<Cart> {
    const cartItem = await this.cartItemModel.findOne({
      where: { id: cartItemId },
      include: [{
        model: Cart,
        where: { userId }
      }]
    }); 

    if (!cartItem) {
      throw new NotFoundException('Cart item not found or does not belong to user');
    }

    await cartItem.destroy();
    return this.getCart(userId);
  }

  async checkProduct(ad_id: number) {
    try {
      const product = await this.adModel.findByPk(ad_id);
      if (!product) {
        console.log(`Product ${ad_id} not found in DB`);
        throw new NotFoundException('a3o3o3o3o not found');
      }
      return product;
    } catch (error) {
      console.error('Database error:', error);
      throw new InternalServerErrorException();
    }
  }

}
