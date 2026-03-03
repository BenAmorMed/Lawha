import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order } from '../orders/order.entity';
import { User } from '../auth/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-08-16',
    });
  }

  async createPaymentIntent(
    amount: number,
    orderId: string,
    currency: string = 'usd'
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
      },
    });

    return paymentIntent;
  }

  async confirmPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    return paymentIntent;
  }

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    // First get the charge ID from the payment intent
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    // Get the charge ID from latest_charge
    const chargeId = paymentIntent.latest_charge;
    
    if (!chargeId || typeof chargeId !== 'string') {
      throw new Error('No charges found for this payment intent');
    }

    // Then refund the charge
    const refund = await this.stripe.refunds.create({
      charge: chargeId,
    });

    return refund;
  }

  async constructWebhookEvent(body: Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }
    return customer as Stripe.Customer;
  }

  async createCustomer(
    email: string,
    name: string
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async sendPaymentSuccessEmail(orderId: string): Promise<void> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: order.user_id },
      });

      if (!user || !user.email) {
        console.error(`User email not found for order ${orderId}`);
        return;
      }

      await this.emailService.sendPaymentSuccessful(order, user.email);
    } catch (error) {
      console.error(`Failed to send payment success email: ${error.message}`);
      // Don't throw - email failure shouldn't stop payment processing
    }
  }

  async sendPaymentFailureEmail(orderId: string, reason?: string): Promise<void> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: order.user_id },
      });

      if (!user || !user.email) {
        console.error(`User email not found for order ${orderId}`);
        return;
      }

      await this.emailService.sendPaymentFailed(order, user.email, reason);
    } catch (error) {
      console.error(`Failed to send payment failure email: ${error.message}`);
      // Don't throw - email failure shouldn't stop payment processing
    }
  }

  async sendRefundEmail(orderId: string, amount: number): Promise<void> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: order.user_id },
      });

      if (!user || !user.email) {
        console.error(`User email not found for order ${orderId}`);
        return;
      }

      await this.emailService.sendOrderRefunded(order, user.email, amount);
    } catch (error) {
      console.error(`Failed to send refund email: ${error.message}`);
      // Don't throw - email failure shouldn't stop refund processing
    }
  }
}
