import { Controller, Get, Post, Body, Param, Patch, Req, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Request } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { create } from 'domain';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateSubOrderStatusDto } from './dto/update-suborder-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get()
  getUserOrders(@Req() req: Request) {
    return this.ordersService.getUserOrders(req.user['id']);
  }

  @Get(':id')
  getOrderById(@Req() req: Request, @Param('id', ParseIntPipe) orderId: number) {
    return this.ordersService.getOrderById(req.user['id'], orderId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateOrderStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      updateStatusDto,
      req.user['id'], 
    );
  }

  @Get('vendor')
  getVendorSubOrders(@Req() req: Request) {
    return this.ordersService.getVendorSubOrders(req.user['id']);
  }

  @Get('vendor/:id')
  getVendorSubOrderById(@Req() req: Request, @Param('id', ParseIntPipe) subOrderId: number) {
    return this.ordersService.getSubOrderById(subOrderId, req.user['id']);
  }

  @Patch('vendor/:id/status')
  updateSubOrderStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) subOrderId: number,
    @Body() updateStatusDto: UpdateSubOrderStatusDto, // استخدام DTO الجديد
  ) {
    return this.ordersService.updateSubOrderStatus(
      subOrderId,
      updateStatusDto,
      req.user['id'],
    );
  }

}