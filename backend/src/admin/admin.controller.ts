import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@Controller('api/v1/admin/orders')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get all orders with filtering and pagination
   * Query params:
   * - status: Filter by order status (pending, processing, shipped, delivered, etc.)
   * - limit: Items per page (default: 20)
   * - offset: Pagination offset (default: 0)
   * - sortBy: Sort field (created_at, total_amount, status)
   * - sortOrder: ASC or DESC
   */
  @Get()
  async getAllOrders(
    @Query('status') status?: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
    @Query('sortBy') sortBy: 'created_at' | 'total_amount' | 'status' = 'created_at',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    return this.adminService.getAllOrders({
      status,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get single order details for admin
   */
  @Get(':id')
  async getOrderById(@Param('id') orderId: string) {
    return this.adminService.getOrderById(orderId);
  }

  /**
   * Update single order status
   * Body:
   * - status: New order status
   * - tracking_number?: Optional tracking number when shipping
   */
  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: { status: string; tracking_number?: string },
  ) {
    return this.adminService.updateOrderStatus(
      orderId,
      body.status,
      body.tracking_number,
    );
  }

  /**
   * Bulk update order statuses
   * Body:
   * - order_ids: Array of order IDs to update
   * - status: New status for all orders
   * - tracking_number?: Optional tracking number
   */
  @Post('bulk-update')
  async bulkUpdateStatus(
    @Body()
    body: {
      order_ids: string[];
      status: string;
      tracking_number?: string;
    },
  ) {
    return this.adminService.bulkUpdateStatus(
      body.order_ids,
      body.status,
      body.tracking_number,
    );
  }

  /**
   * Get order analytics dashboard
   * Returns: summary stats, status breakdown, orders by day chart data
   */
  @Get('analytics/dashboard')
  async getAnalytics() {
    return this.adminService.getOrderAnalytics();
  }
}
