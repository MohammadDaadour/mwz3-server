import { Controller, Get, Post, Body, Param, Patch, Req, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  createOrder(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    // Assume user data is sent from the frontend
    const userId = req.body.userId; // Example of accessing user ID from request body
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  getUserOrders(@Req() req: Request) {
    return this.ordersService.getUserOrders(req.user['id']);
  }

  @Get(':id')
  getOrderById(@Req() req: Request, @Param('id', ParseIntPipe) orderId: number) {
    return this.ordersService.getOrderById(req.user['id'], orderId);
  }

  @Get('vendor/orders')
  getVendorOrders(@Req() req: Request) {
    return this.ordersService.getVendorOrders(req.user['id']);
  }

  @Patch(':id/status')
  updateOrderStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(req.user['id'], orderId, updateStatusDto);
  }
}