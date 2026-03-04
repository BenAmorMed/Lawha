import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Optional,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderCreatedResponseDto } from './dto/create-order.dto';

/**
 * POST /api/v1/orders — Route publique (guest) OU protégée (JWT optionnel).
 * On tente d'extraire l'userId depuis le JWT si présent, sinon on passe undefined.
 */
@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Request() req: any,
  ): Promise<OrderCreatedResponseDto> {
    // Extract userId from JWT if present in Authorization header
    const userId = req.user?.id || req.user?.sub || undefined;
    return this.ordersService.createOrder(dto, userId);
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getMyOrders(@Request() req: any): Promise<any[]> {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrder(@Param('id') orderId: string, @Request() req: any): Promise<any> {
    const userId = req.user?.id || undefined;
    return this.ordersService.getOrderById(orderId, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelOrder(@Param('id') orderId: string, @Request() req: any): Promise<void> {
    return this.ordersService.cancelOrder(orderId, req.user.id);
  }
}
