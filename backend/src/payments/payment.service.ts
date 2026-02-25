import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
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

    if (!paymentIntent.charges.data.length) {
      throw new Error('No charges found for this payment intent');
    }

    const chargeId = paymentIntent.charges.data[0].id;

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
    return this.stripe.customers.retrieve(customerId);
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
}
