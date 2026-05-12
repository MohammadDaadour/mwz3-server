import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order) private orderModel: typeof Order,
    @InjectModel(OrderItem) private orderItemModel: typeof OrderItem,
    @InjectModel(Ad) private productModel: typeof Ad,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // Check if user exists
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findByPk(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      totalAmount += product.value * item.quantity;
    }

    // Create order
    const order = await this.orderModel.create({
      userId,
      shippingAddress: createOrderDto.shippingAddress,
      phoneNumber: createOrderDto.phoneNumber,
      notes: createOrderDto.notes,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    // Create order items
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findByPk(item.productId);
      await this.orderItemModel.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.value,
      });
    }

    return this.getOrderById(userId, order.id);
  }

  async getOrderById(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderItem,
          include: [Ad],
        },
        User,
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { userId },
      include: [OrderItem],
      order: [['createdAt', 'DESC']],
    });
  }

  async getVendorOrders(vendorId: number): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { vendorId },
      include: [
        {
          model: OrderItem,
          include: [Ad],
        },
        User,
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateOrderStatus(vendorId: number, orderId: number, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findOne({
      where: { id: orderId, vendorId },
    });
  
    if (!order) {
      throw new NotFoundException(`Order not found or you don't have permission`);
    }
  
    order.status = updateStatusDto.status;
    await order.save();
    return order;
  }
}