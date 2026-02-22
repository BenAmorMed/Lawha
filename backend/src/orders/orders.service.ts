import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/product.entity';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderListDto,
  UpdateOrderStatusDto,
  OrderPriceBreakdownDto,
} from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    // Validate and fetch products
    const products = await Promise.all(
      createOrderDto.items.map((item) =>
        this.productRepository.findOne({ where: { id: item.product_id } }),
      ),
    );

    if (products.some((p) => !p)) {
      throw new Error('One or more products not found');
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (let i = 0; i < createOrderDto.items.length; i++) {
      const item = createOrderDto.items[i];
      const product = products[i];

      const unitPrice = parseFloat(product.base_price.toString());
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      const orderItem = new OrderItem();
      orderItem.product_id = product.id;
      orderItem.quantity = item.quantity;
      orderItem.unit_price = unitPrice;
      orderItem.size_selected = item.size_selected || '';
      orderItem.frame_option = item.frame_option || '';
      orderItem.subtotal = subtotal;

      orderItems.push(orderItem);
    }

    // Create order
    const order = this.orderRepository.create({
      user_id: userId,
      status: OrderStatus.PENDING,
      total_amount: totalAmount,
      shipping_address: createOrderDto.shipping_address,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Save order items
    for (const item of orderItems) {
      item.order_id = savedOrder.id;
    }
    await this.orderItemRepository.save(orderItems);

    return this.formatOrderResponse(savedOrder, orderItems);
  }

  async getUserOrders(userId: string): Promise<OrderListDto[]> {
    const orders = await this.orderRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    // Get item counts
    const itemCounts = await Promise.all(
      orders.map((order) =>
        this.orderItemRepository.count({ where: { order_id: order.id } }),
      ),
    );

    return orders.map((order, idx) => ({
      id: order.id,
      status: order.status,
      total_amount: parseFloat(order.total_amount.toString()),
      items_count: itemCounts[idx],
      created_at: order.created_at,
      shipped_at: order.shipped_at,
    }));
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const items = await this.orderItemRepository.find({
      where: { order_id: orderId },
    });

    return this.formatOrderResponse(order, items);
  }

  async updateOrderStatus(
    orderId: string,
    updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.status = updateDto.status as OrderStatus;

    if (updateDto.tracking_number) {
      order.tracking_number = updateDto.tracking_number;
    }

    if (updateDto.status === OrderStatus.SHIPPED) {
      order.shipped_at = new Date();
    }

    if (updateDto.status === OrderStatus.DELIVERED) {
      order.delivered_at = new Date();
    }

    await this.orderRepository.save(order);

    const items = await this.orderItemRepository.find({
      where: { order_id: orderId },
    });

    return this.formatOrderResponse(order, items);
  }

  async cancelOrder(orderId: string, userId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.PRINTING || order.status === OrderStatus.SHIPPED) {
      throw new Error('Cannot cancel order that is already printing or shipped');
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);
  }

  async getOrderPriceBreakdown(orderId: string): Promise<OrderPriceBreakdownDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const items = await this.orderItemRepository.find({
      where: { order_id: orderId },
    });

    // Fetch product details for item names
    const itemsWithNames = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: { id: item.product_id },
        });
        return {
          product_name: product?.name || 'Unknown Product',
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price.toString()),
          subtotal: parseFloat(item.subtotal.toString()),
        };
      }),
    );

    const subtotal = parseFloat(order.total_amount.toString());
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100

    return {
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
      items: itemsWithNames,
    };
  }

  private formatOrderResponse(
    order: Order,
    items: OrderItem[],
  ): OrderResponseDto {
    return {
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      total_amount: parseFloat(order.total_amount.toString()),
      shipping_address: order.shipping_address,
      tracking_number: order.tracking_number,
      items: items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price.toString()),
        size_selected: item.size_selected,
        frame_option: item.frame_option,
        subtotal: parseFloat(item.subtotal.toString()),
        created_at: item.created_at,
      })),
      created_at: order.created_at,
      updated_at: order.updated_at,
    };
  }
}
