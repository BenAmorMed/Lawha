import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderListDto,
  UpdateOrderStatusDto,
  OrderPriceBreakdownDto,
} from './orders.dto';

@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(user.id, createOrderDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyOrders(@CurrentUser() user: User): Promise<OrderListDto[]> {
    return this.ordersService.getUserOrders(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: User,
  ): Promise<OrderResponseDto> {
    return this.ordersService.getOrderById(orderId, user.id);
  }

  @Get(':id/breakdown')
  @HttpCode(HttpStatus.OK)
  async getOrderBreakdown(
    @Param('id') orderId: string,
  ): Promise<OrderPriceBreakdownDto> {
    return this.ordersService.getOrderPriceBreakdown(orderId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(orderId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.ordersService.cancelOrder(orderId, user.id);
  }
}
