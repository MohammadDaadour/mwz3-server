import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { subOrder, subOrderStatus } from './entities/sub-order.entity';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateSubOrderStatusDto } from './dto/update-suborder-status.dto';
import { where } from 'sequelize';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order) private orderModel: typeof Order,
    @InjectModel(subOrder) private subOrderModel: typeof subOrder,
    @InjectModel(OrderItem) private orderItemModel: typeof OrderItem,
    @InjectModel(Ad) private productModel: typeof Ad,
    @InjectModel(User) private userModel: typeof User,
  ) { }

  // Create order
  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {

    let totalAmount = 0;
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findByPk(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      totalAmount += product.value * item.quantity;
    }
    // Group items by vendor
    const vendorItems = new Map<number, typeof createOrderDto.items>();

    // First pass to group items by vendor
    for (const item of createOrderDto.items) {
      const product = await this.productModel.findByPk(item.productId, {
        include: [User]  // Add user association
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      // Add user validation
      const user = await this.userModel.findByPk(createOrderDto.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${createOrderDto.userId} not found`);
      }
      console.log('Vendor ID:', product.user.id);
      const vendorId = product.user.id;
      if (!vendorItems.has(vendorId)) {
        vendorItems.set(vendorId, []);
      }
      vendorItems.get(vendorId).push(item);
    }

    // Create main order
    const order = await this.orderModel.create({
      userId: createOrderDto.userId,
      first_name: createOrderDto.first_name,
      last_name: createOrderDto.last_name,
      email: createOrderDto.email,
      phone_number: createOrderDto.phone_number,

      street: createOrderDto.street,
      building: createOrderDto.building,
      floor: createOrderDto.floor,
      apartment: createOrderDto.apartment,
      city: createOrderDto.city,
      country: createOrderDto.country,
      state: createOrderDto.state,
      postal_code: createOrderDto.postal_code,

      payment_method: createOrderDto.payment_method,
      notes: createOrderDto.notes,
      totalAmount,
      status: OrderStatus.PENDING,
    });


    // Create suborders for each vendor
    for (const [vendorId, items] of vendorItems) {
      const subOrder = await this.subOrderModel.create({
        orderId: order.id,
        vendorId,
        status: subOrderStatus.PENDING,
      });

      // Create order items for this suborder
      for (const item of items) {
        const product = await this.productModel.findByPk(item.productId);
        await this.orderItemModel.create({
          orderId: order.id,
          subOrderId: subOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.value,
        });
      }
    }

    return order;
  }

  //   return this.getOrderById(userId, order.id);
  // }

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

  // async getVendorOrders(vendorId: number): Promise<Order[]> {
  //   return this.orderModel.findAll({
  //     include: [
  //       {
  //         model: OrderItem,
  //         required: true, // 🔐 only orders with matching items
  //         include: [
  //           {
  //             model: Ad,
  //             where: { userFK: vendorId }, // ✅ match vendor
  //             required: true, // 🔐 ensure filter applies to OrderItem
  //           },
  //         ],
  //       },
  //       User,
  //     ],
  //     order: [['createdAt', 'DESC']],
  //   });
  // }


  async updateOrderStatus(
    orderId: number,
    updateStatusDto: UpdateOrderStatusDto,
    vendorId: number,
  ): Promise<Order> {
    // Validate that status is provided
    if (!updateStatusDto || !updateStatusDto.status) {
      throw new BadRequestException('Order status is required');
    }

    const order = await this.orderModel.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Ad,
              where: { userFK: vendorId },
              required: true,
            },
          ],
        },
      ],
    });

    if (!order) {
      throw new ForbiddenException("You don't have permission to update this order");
    }

    order.status = updateStatusDto.status;
    await order.save();
    return order;
  }


  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.findAll({
      include: [
        {
          model: subOrder,
          include: [
            {
              model: OrderItem,
              include: [Ad]
            },
            User
          ]
        },
        User
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // Get all suborders for a vendor
  async getVendorSubOrders(vendorId: number): Promise<subOrder[]> {
    return this.subOrderModel.findAll({
      where: { vendorId },
      include: [
        {
          model: OrderItem,
          include: [Ad]
        },
        {
          model: Order,
          include: [User]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  // Get a specific suborder by ID
  async getSubOrderById(subOrderId: number, vendorId: number): Promise<subOrder> {
    const subOrder = await this.subOrderModel.findOne({
      where: {
        id: subOrderId,
        vendorId // Ensure vendor can only access their own suborders
      },
      include: [
        {
          model: OrderItem,
          include: [Ad]
        },
        {
          model: Order,
          include: [User]
        }
      ]
    });

    if (!subOrder) {
      throw new NotFoundException(`SubOrder with ID ${subOrderId} not found`);
    }

    return subOrder;
  }

  // Update suborder status
  async updateSubOrderStatus(
    subOrderId: number,
    updateStatusDto: UpdateSubOrderStatusDto, // استخدام DTO الجديد
    vendorId: number
  ): Promise<subOrder> {
    // Validate that status is provided
    if (!updateStatusDto || !updateStatusDto.status) {
      throw new BadRequestException('Order status is required');
    }

    const subOrder = await this.subOrderModel.findOne({
      where: {
        id: subOrderId,
        vendorId // Ensure vendor can only update their own suborders
      }
    });

    if (!subOrder) {
      throw new ForbiddenException("You don't have permission to update this suborder");
    }

    // الآن يمكننا استخدام الحالة مباشرة بدون تحويل النوع
    subOrder.status = updateStatusDto.status;
    await subOrder.save();

    // Check if all suborders are completed to update main order status
    if (updateStatusDto.status === subOrderStatus.COMPLETED) {
      await this.checkAndUpdateMainOrderStatus(subOrder.orderId);
    }

    return subOrder;
  }

  // Helper method to check and update main order status
  private async checkAndUpdateMainOrderStatus(orderId: number): Promise<void> {
    const subOrders = await this.subOrderModel.findAll({
      where: { orderId }
    });

    const allCompleted = subOrders.every(so => so.status === subOrderStatus.COMPLETED);

    if (allCompleted) {
      const order = await this.orderModel.findByPk(orderId);
      order.status = OrderStatus.COMPLETED;
      await order.save();
    }
  }
}