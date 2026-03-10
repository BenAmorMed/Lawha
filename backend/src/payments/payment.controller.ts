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
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/entities/user.entity';

@Controller('api/v1/payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private ordersService: OrdersService
  ) { }

  /**
   * Create a payment intent for an order
   * POST /api/v1/payments/create-intent
   */
  @Post('create-intent')
  @UseGuards(OptionalJwtAuthGuard)
  async createPaymentIntent(
    @Body('orderId') orderId: string,
    @Body('amount') _amount: number, // Ignore user-provided amount for security
    @CurrentUser() user: User | null
  ) {
    // Verify order exists and belongs to user (or is a guest order)
    const { order } = await this.ordersService.getOrderById(orderId, user?.id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Explicit ownership check: if order is registered to a user, it must match current user
    if (order.userId && order.userId !== user?.id) {
      throw new BadRequestException('Order does not belong to this user');
    }

    // Security check: Use the actual order total from the database instead of user-provided amount
    const secureAmount = order.total;

    // Create Stripe payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(
      secureAmount,
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
  @UseGuards(OptionalJwtAuthGuard)
  async confirmPayment(
    @Body('paymentIntentId') paymentIntentId: string,
    @Body('orderId') orderId: string,
    @CurrentUser() user: User | null
  ) {
    // Verify order exists and belongs to user (or is a guest order)
    const { order } = await this.ordersService.getOrderById(orderId, user?.id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Explicit ownership check: if order is registered to a user, it must match current user
    if (order.userId && order.userId !== user?.id) {
      throw new BadRequestException('Order does not belong to this user');
    }

    // Get payment intent
    const paymentIntent = await this.paymentService.confirmPaymentIntent(
      paymentIntentId
    );

    // Security check: Verify that the payment intent amount matches the order total
    const expectedAmountCents = Math.round(order.total * 100);
    if (paymentIntent.amount !== expectedAmountCents) {
      throw new BadRequestException('Payment amount mismatch');
    }

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update order status to processing
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'processing',
      });

      // Send payment success email
      await this.paymentService.sendPaymentSuccessEmail(orderId);

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
      await this.ordersService.updateOrderStatus(orderId, {
        status: 'processing',
      });
      await this.paymentService.sendPaymentSuccessEmail(orderId);
      console.log(`Payment succeeded for order: ${orderId}`);
    }
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      // Don't update status on payment failure - leave order as is for potential retry
      await this.paymentService.sendPaymentFailureEmail(orderId);
      console.log(`Payment failed for order: ${orderId}`);
    }
  }

  private async handleRefund(charge: any) {
    console.log(`Refund processed for charge: ${charge.id}`);
    // Update order status to refunded if needed
  }
}
