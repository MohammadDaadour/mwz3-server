// payment/payment.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class PaymentService {
  private readonly PAYMOB_API_KEY: string;
  private readonly PAYMOB_API_URL = 'https://accept.paymob.com/api';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {
    this.PAYMOB_API_KEY = this.configService.get<string>('PAYMOB_API_KEY');
  }

  async authenticate(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post('https://accept.paymobsolutions.com/api/auth/tokens', {
          api_key: this.PAYMOB_API_KEY,
        })
      );
      return response.data.token;
    } catch (error) {
      Logger.error('Paymob authentication failed', JSON.stringify(error.response?.data));
      throw error;
    }
  }

  async createPaymobOrder(
    token: string,
    amountCents: number,
    merchantOrderId: string | number,
    currency: string = 'EGP'
  ): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://accept.paymobsolutions.com/api/ecommerce/orders',
          {
            auth_token: token,
            delivery_needed: false,
            amount_cents: amountCents.toString(),
            currency,
            merchant_order_id: merchantOrderId.toString(),
          }
        )
      );
      return response.data.id;
    } catch (error) {
      Logger.error('Paymob order creation failed', JSON.stringify(error.response?.data));
      throw error;
    }
  }

  async generatePaymentKey(
    token: string,
    amountCents: number,
    paymobOrderId: number,
    user: any,
    currency: string = 'EGP'
  ): Promise<string> {
    try {
      const billingData = {
        first_name: user.firstName || 'Test',
        last_name: user.lastName || 'User',
        email: user.email || 'test@example.com',
        phone_number: user.phone || '+201000000000',
        country: 'EG',
        city: user.city || 'Cairo',
        street: user.street || 'N/A',
        building: user.building || 'N/A',
        floor: user.floor || '0',
        apartment: user.apartment || '0',
        postal_code: user.postalCode || '00000'
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://accept.paymobsolutions.com/api/acceptance/payment_keys',
          {
            auth_token: token,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: paymobOrderId,
            billing_data: billingData,
            currency,
            integration_id: this.configService.get('PAYMOB_CARD_INTEGRATION_ID'),
          }
        )
      );
      return response.data.token;
    } catch (error) {
      Logger.error('Payment key generation failed', JSON.stringify(error.response?.data));
      throw error;
    }
  }

  getPaymentUrl(paymentToken: string): string {
    return `https://accept.paymobsolutions.com/api/acceptance/iframes/${this.configService.get('PAYMOB_IFRAME_ID')}?payment_token=${paymentToken}`;
  }

  validateWebhookSignature(data: any, signature: string): boolean {
    const secret = this.configService.get<string>('PAYMOB_HMAC_SECRET');

    if (!secret) {
      Logger.error('Missing PAYMOB_HMAC_SECRET');
      throw new InternalServerErrorException('Payment configuration error');
    }

    const obj = data.obj || data;

    const hmacString =
      obj.amount_cents +
      obj.created_at +
      obj.currency +
      obj.error_occured +
      obj.has_parent_transaction +
      obj.id +
      obj.integration_id +
      obj.is_3d_secure +
      obj.is_auth +
      obj.is_capture +
      obj.is_refunded +
      obj.is_standalone_payment +
      obj.is_voided +
      (obj.order?.id || obj.order) +
      obj.owner +
      obj.pending +
      (obj.source_data?.pan || obj['source_data.pan']) +
      (obj.source_data?.sub_type || obj['source_data.sub_type']) +
      (obj.source_data?.type || obj['source_data.type']) +
      obj.success;

    const computedHmac = createHmac('sha512', secret)
      .update(hmacString)
      .digest('hex');

    const isValid = computedHmac === signature;

    return isValid;
  }

  async saveTransaction(data: any) {
    const transactionData = {
      amount_cents: data.amount_cents,
      created_at: data.created_at,
      currency: data.currency,
      error_occured: data.error_occured,
      has_parent_transaction: data.has_parent_transaction,
      integration_id: data.integration_id,
      is_3d_secure: data.is_3d_secure,
      is_auth: data.is_auth,
      is_capture: data.is_capture,
      is_refunded: data.is_refunded,
      is_standalone_payment: data.is_standalone_payment,
      is_voided: data.is_voided,
      order_id: data.order?.id || data.order,
      owner: data.owner,
      pending: data.pending,
      source_data_pan: data.source_data?.pan || data['source_data.pan'],
      source_data_sub_type: data.source_data?.sub_type || data['source_data.sub_type'],
      source_data_type: data.source_data?.type || data['source_data.type'],
      success: data.success,
    };

    // try {
    //   // Use upsert to handle duplicate transactions (e.g. from both webhook and redirect)
    //   return await this.paymentModel.upsert(transactionData);
    // } catch (error) {
    //   Logger.error('Failed to save transaction', error);
    //   // We don't throw here to avoid failing the webhook response if saving fails
    //   // (e.g. if it's a duplicate and upsert fails for some reason, though upsert shouldn't)
    //   return null;
    // }
  }
}