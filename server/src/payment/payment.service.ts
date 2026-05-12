// payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
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
    this.PAYMOB_API_KEY = 'kalsdjjjjj'; //this.configService.get<string>('PAYMOB_API_KEY')
  }

  async authenticate() {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.PAYMOB_API_URL}/auth/tokens`,
        { api_key: this.PAYMOB_API_KEY },
      );
      return response.data.token;
    } catch (error) {
      throw new Error(`Failed to authenticate with Paymob: ${error}`);
    }
  }

  async createOrder(token: string, amount: number) {  // , vendorId: string
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.PAYMOB_API_URL}/ecommerce/orders`,
        {
          auth_token: token,
          amount_cents: amount,
          currency: 'EGP',
          items: [],
          // merchant_order_id: vendorId,
        },
      );
      return response.data;
    }
    catch (error) {
      if (error.response) {
        console.error('Error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async getPaymentKey(
    token: string,
    orderId: string,
    integrationId: number, // From Paymob dashboard (e.g., card, mobile wallet)
    billingData: Record<string, any>,
    amount: number, // User/customer details
  ) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.PAYMOB_API_URL}/acceptance/payment_keys`,
        {
          auth_token: token,
          amount_cents: amount, // Example amount
          expiration: 3600,
          order_id: orderId,
          billing_data: billingData,
          currency: 'EGP',
          integration_id: integrationId,
        },
      );
      return response.data.token;
    }
    catch (error) {
      throw new Error(`Can't generate a payment key: ${error}`)
    }
  }

  async savePayment(paymentData: Partial<Payment>): Promise<Payment> {
    ///////////////////////////////////////////////////////////////////////
    const payment = await this.paymentModel.create(paymentData);
    
    // If payment is successful, update user's balance
    if (payment.success && payment.amount_cents > 0) {
      await this.updateUserBalance(payment.owner, payment.amount_cents);
    }
    
    return payment;
  }

  private async updateUserBalance(userId: string, amount: number) {
    const user = await this.userModel.findByPk(parseInt(userId));
    if (user) {
      await user.update({
        balance: user.balance + amount
      });
    }
  }

  async getUserBalance(userId: number): Promise<number> {
    const user = await this.userModel.findByPk(userId);
    return user ? user.balance : 0;
  }

  async withdrawBalance(userId: number, amount: number): Promise<boolean> {
    const user = await this.userModel.findByPk(userId);
    
    if (!user || user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    await user.update({
      balance: user.balance - amount,
      lastWithdrawalAt: new Date()
    });

    return true;
  }
}