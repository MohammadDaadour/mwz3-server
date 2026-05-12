// payment/payment.controller.ts
import { Body, Controller, Post, Headers, UnauthorizedException, Redirect } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {
  }

  @Public()
  @Post('initiate')
  // @Redirect()
  async initiatePayment(
    @Body() body: { amount: number; vendorId: string; billingData: any },
  ) {
    const token = await this.paymentService.authenticate();
    const order = await this.paymentService.createOrder(
      token,
      body.amount,
      // body.vendorId,
    );
    const paymentKey = await this.paymentService.getPaymentKey(
      token,
      order.id,
      4235633,
      body.billingData,
      body.amount,
    );
    return {
      paymentKey,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/789865?payment_token=${paymentKey}`,
    };
  } 

  @Post('callback')
  async handleWebhook(@Body() body: any, @Headers('hmac') hmac: string) {
    const {
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      id,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order: { id: order_id },
      owner,
      pending,
      source_data: {
        pan: source_data_pan,
        sub_type: source_data_sub_type,
        type: source_data_type,
      },
      success,
    } = body.obj; 

    // Create a lexographical string
    const lexographical =
      amount_cents +
      created_at +
      currency +
      error_occured +
      has_parent_transaction +
      id +
      integration_id +
      is_3d_secure +
      is_auth +
      is_capture +
      is_refunded +
      is_standalone_payment +
      is_voided +
      order_id +
      owner +
      pending +
      source_data_pan +
      source_data_sub_type +
      source_data_type +
      success;
//
    // Create HMAC hash
    const hash = createHmac('sha512', '3AADCFAABFF2C85C3CBCE2FF3B3A408D')
      .update(lexographical)
      .digest('hex');

    // Verify HMAC
    if (hash !== hmac) {
      throw new UnauthorizedException('Invalid HMAC');
    }

    // Save payment data
    const paymentData = {
      id,
      amount_cents,
      created_at,
      currency,
      error_occured,
      has_parent_transaction,
      integration_id,
      is_3d_secure,
      is_auth,
      is_capture,
      is_refunded,
      is_standalone_payment,
      is_voided,
      order_id,
      owner,
      pending,
      source_data_pan,
      source_data_sub_type,
      source_data_type,
      success,
    };

    await this.paymentService.savePayment(paymentData);
  }
}

