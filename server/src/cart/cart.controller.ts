import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, NotFoundException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  
  @Public()
  @Get(':userId')
  async getCart(@Param('userId') userId: number) {
    try {
      return await this.cartService.getCart(userId);
    } catch (error) {
      throw new NotFoundException(`Cart not found for user ${userId}`);
    }
  }
  
  @Public()
  @Post('add')
  async addItem(
    @Body() { userId, ad_id, quantity }: { userId: number; ad_id: number; quantity: number }
  ) {
    try {
      if (!userId) {
        throw new BadRequestException('userId is required');
      }
      
      // Check if the product exists
      const product = await this.cartService.checkProductExists(ad_id);
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      
      // Add to database
      return await this.cartService.addItem(userId, ad_id, quantity);
      
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Delete('remove/:userId/:itemId')
  async removeItem(
    @Param('userId') userId: number,
    @Param('itemId', ParseIntPipe) cartItemId: number
  ) {
    try {
      return await this.cartService.removeItem(userId, cartItemId);
    } catch (error) {
      throw new NotFoundException('Item not found or does not belong to user');
    }
  }

  @Public()
  @Post('check')
  async checkProduct(@Body() { ad_id }: { ad_id: number }) {
    return await this.cartService.checkProduct(ad_id);
  }
}
