import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) { }

  async getAllOrders(filters: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const {
      status,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
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
        userEmail: order.user?.email,
        userId: order.userId,
        status: order.status,
        total: order.total,
        itemsCount: order.items?.length || 0,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        trackingNumber: order.trackingNumber,
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
      userEmail: order.user?.email,
      userId: order.userId,
      status: order.status,
      total: order.total,
      shippingAddr: order.shippingAddr,
      trackingNumber: order.trackingNumber,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
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
      order.trackingNumber = trackingNumber;
    }

    if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await this.ordersRepository.save(order);

    this.logger.log(
      `Order ${orderId} status updated to ${status}`,
      AdminService.name,
    );

    return {
      id: order.id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
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
      .select('SUM(order.total)', 'total')
      .where('order.status IN (:...statuses)', {
        statuses: ['shipped', 'delivered'],
      })
      .getRawOne();

    // Average order value
    const avgValue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('AVG(order.total)', 'average')
      .getRawOne();

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :date', { date: sevenDaysAgo })
      .getCount();

    // Orders by day (last 7 days)
    const ordersByDay = await this.ordersRepository
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt >= :date', { date: sevenDaysAgo })
      .groupBy('DATE(order.createdAt)')
      .orderBy('DATE(order.createdAt)', 'ASC')
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
        order.trackingNumber = trackingNumber;
      }

      if (status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }

      if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
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

  async approveOrder(orderId: string) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    order.status = 'printing' as any;
    await this.ordersRepository.save(order);
    this.logger.log(`Order ${orderId} approved for printing`);
    return { id: order.id, status: order.status };
  }

  async rejectOrder(orderId: string, reason?: string) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    order.status = 'cancelled' as any;
    await this.ordersRepository.save(order);
    this.logger.log(`Order ${orderId} rejected. Reason: ${reason || 'none'}`);
    return { id: order.id, status: order.status, reason };
  }

  // --- REVIEW MANAGEMENT ---

  async getAllReviews(filters: {
    productId?: string;
    userId?: string;
    rating?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'rating' | 'helpfulCount';
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const {
      productId,
      userId,
      rating,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');

    if (productId) {
      query.andWhere('review.productId = :productId', { productId });
    }

    if (userId) {
      query.andWhere('review.userId = :userId', { userId });
    }

    if (rating) {
      query.andWhere('review.rating = :rating', { rating });
    }

    const total = await query.getCount();

    // Whitelist sortBy fields to prevent SQL injection
    const allowedSortBy = ['createdAt', 'rating', 'helpfulCount'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const reviews = await query
      .orderBy(`review.${safeSortBy}`, safeSortOrder)
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      data: reviews,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async deleteReviewAdmin(reviewId: string) {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    await this.reviewsRepository.delete(reviewId);
    this.logger.log(`Review ${reviewId} deleted by Admin`);
    return { success: true };
  }
}
