import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('api/v1/payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private ordersService: OrdersService
  ) {}

  /**
   * Create a payment intent for an order
   * POST /api/v1/payments/create-intent
   */
  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @CurrentUser() user: User
  ) {
    // Verify order exists and belongs to user
    const order = await this.ordersService.getOrderById(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user_id !== user.id) {
      throw new BadRequestException('Order does not belong to this user');
    }

    // Create Stripe payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(
      amount,
      orderId,
      'usd'
    );

    return {
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  }

  /**
   * Confirm payment and update order status
   * POST /api/v1/payments/confirm
   */
  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(
    @Body('paymentIntentId') paymentIntentId: string,
    @Body('orderId') orderId: string,
    @CurrentUser() user: User
  ) {
    // Verify order exists
    const order = await this.ordersService.getOrderById(orderId);
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.user_id !== user.id) {
      throw new BadRequestException('Order does not belong to this user');
    }

    // Get payment intent
    const paymentIntent = await this.paymentService.confirmPaymentIntent(
      paymentIntentId
    );

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update order status to processing
      await this.ordersService.updateOrderStatus(orderId, 'processing');

      return {
        success: true,
        message: 'Payment successful',
        status: paymentIntent.status,
      };
    } else if (paymentIntent.status === 'requires_action') {
      return {
        success: false,
        message: 'Payment requires additional action',
        status: paymentIntent.status,
      };
    } else {
      return {
        success: false,
        message: 'Payment failed',
        status: paymentIntent.status,
      };
    }
  }

  /**
   * Webhook endpoint for Stripe events
   * POST /api/v1/payments/webhook
   */
  @Post('webhook')
  async handleWebhook(
    @Req() request: any,
    @Headers('stripe-signature') signature: string
  ) {
    let event: any;

    try {
      event = await this.paymentService.constructWebhookEvent(
        request.rawBody,
        signature
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle different events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
      default:
        console.log(`Unknown event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await this.ordersService.updateOrderStatus(orderId, 'processing');
      console.log(`Payment succeeded for order: ${orderId}`);
    }
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await this.ordersService.updateOrderStatus(orderId, 'payment_failed');
      console.log(`Payment failed for order: ${orderId}`);
    }
  }

  private async handleRefund(charge: any) {
    console.log(`Refund processed for charge: ${charge.id}`);
    // Update order status to refunded if needed
  }
}
