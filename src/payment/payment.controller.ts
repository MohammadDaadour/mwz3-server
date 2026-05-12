// payment/payment.controller.ts
import { Body, Controller, Post, Get, UnauthorizedException, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {
  }
  @Public()
  @Post('create')
  async createPayment(@Body() body: any) {
    const { amount, user } = body;
    const token = await this.paymentService.authenticate();

    const merchantOrderId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const amountCents = Math.ceil(Number(amount) * 100);

    const orderId = await this.paymentService.createPaymobOrder(
      token,
      amountCents,
      merchantOrderId,
    );

    const paymentToken = await this.paymentService.generatePaymentKey(
      token,
      amountCents,
      orderId,
      user,
    );

    const url = this.paymentService.getPaymentUrl(paymentToken);

    return { url };
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any, @Query('hmac') hmac: string) {
    if (!this.paymentService.validateWebhookSignature(body, hmac)) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    if (body.obj) {
      await this.paymentService.saveTransaction(body.obj);
    }

    return { received: true };
  }

  @Public()
  @Get('webhook')
  async handleWebhookRedirect(@Query() query: any) {
    const { hmac, ...data } = query;
    if (!this.paymentService.validateWebhookSignature(data, hmac)) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    await this.paymentService.saveTransaction(data);

    return {
      message: 'Payment processed',
      success: data.success === 'true',
      orderId: data.order
    };
  }
}

