import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async getAllOrders(filters: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'total_amount' | 'status';
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const {
      status,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = filters;

    const query = this.ordersRepository.createQueryBuilder('order');

    if (status) {
      query.where('order.status = :status', { status });
    }

    const total = await query.getCount();

    const orders = await query
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      data: orders.map((order) => ({
        id: order.id,
        user_email: order.user?.email,
        user_id: order.user_id,
        status: order.status,
        total_amount: order.total_amount,
        items_count: order.items?.length || 0,
        created_at: order.created_at,
        updated_at: order.updated_at,
        tracking_number: order.tracking_number,
      })),
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      id: order.id,
      user_email: order.user?.email,
      user_id: order.user_id,
      status: order.status,
      total_amount: order.total_amount,
      shipping_address: order.shipping_address,
      tracking_number: order.tracking_number,
      items: order.items,
      created_at: order.created_at,
      updated_at: order.updated_at,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingNumber?: string,
  ) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const validStatuses = [
      'pending',
      'processing',
      'printing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    order.status = status as OrderStatus;

    if (trackingNumber) {
      order.tracking_number = trackingNumber;
    }

    if (status === 'shipped' && !order.shipped_at) {
      order.shipped_at = new Date();
    }

    if (status === 'delivered' && !order.delivered_at) {
      order.delivered_at = new Date();
    }

    await this.ordersRepository.save(order);

    this.logger.log(
      `Order ${orderId} status updated to ${status}`,
      AdminService.name,
    );

    return {
      id: order.id,
      status: order.status,
      tracking_number: order.tracking_number,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
    };
  }

  async getOrderAnalytics() {
    // Total orders count
    const totalOrders = await this.ordersRepository.count();

    // Orders by status
    const ordersByStatus = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('order.status')
      .getRawMany();

    // Revenue (total amount from completed orders)
    const revenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .where('order.status IN (:...statuses)', {
        statuses: ['shipped', 'delivered'],
      })
      .getRawOne();

    // Average order value
    const avgValue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('AVG(order.total_amount)', 'average')
      .getRawOne();

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :date', { date: sevenDaysAgo })
      .getCount();

    // Orders by day (last 7 days)
    const ordersByDay = await this.ordersRepository
      .createQueryBuilder('order')
      .select('DATE(order.created_at)', 'date')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.created_at >= :date', { date: sevenDaysAgo })
      .groupBy('DATE(order.created_at)')
      .orderBy('DATE(order.created_at)', 'ASC')
      .getRawMany();

    return {
      summary: {
        total_orders: totalOrders,
        revenue: parseFloat(revenue?.total || 0),
        average_order_value: parseFloat(avgValue?.average || 0),
        orders_last_7_days: recentOrders,
      },
      status_breakdown: ordersByStatus.reduce(
        (acc, item) => ({
          ...acc,
          [item.status]: parseInt(item.count, 10),
        }),
        {},
      ),
      orders_by_day: ordersByDay.map((item) => ({
        date: item.date,
        count: parseInt(item.count, 10),
      })),
    };
  }

  async bulkUpdateStatus(
    orderIds: string[],
    status: string,
    trackingNumber?: string,
  ) {
    const orders = await this.ordersRepository.find({
      where: orderIds.map((id) => ({ id })),
    });

    if (orders.length === 0) {
      throw new NotFoundException('No orders found');
    }

    const validStatuses = [
      'pending',
      'processing',
      'printing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updatedOrders = orders.map((order) => {
      order.status = status as OrderStatus;

      if (trackingNumber) {
        order.tracking_number = trackingNumber;
      }

      if (status === 'shipped' && !order.shipped_at) {
        order.shipped_at = new Date();
      }

      if (status === 'delivered' && !order.delivered_at) {
        order.delivered_at = new Date();
      }

      return order;
    });

    await this.ordersRepository.save(updatedOrders);

    this.logger.log(
      `Bulk updated ${updatedOrders.length} orders to status ${status}`,
      AdminService.name,
    );

    return {
      updated_count: updatedOrders.length,
      status,
    };
  }
}
