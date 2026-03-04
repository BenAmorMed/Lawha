import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { PrintJob } from './print-job.entity';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { FrameOption } from '../products/entities/frame-option.entity';
import { CreateOrderDto, OrderCreatedResponseDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(PrintJob)
    private readonly printJobRepository: Repository<PrintJob>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSize)
    private readonly productSizeRepository: Repository<ProductSize>,
    @InjectRepository(FrameOption)
    private readonly frameOptionRepository: Repository<FrameOption>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async createOrder(dto: CreateOrderDto, userId?: string): Promise<OrderCreatedResponseDto> {
    // ── ÉTAPE 1 ── Recalcul du prix côté backend
    const size = await this.productSizeRepository.findOne({ where: { id: dto.productSizeId } });
    if (!size) throw new BadRequestException(`ProductSize not found: ${dto.productSizeId}`);

    const product = await this.productRepository.findOne({ where: { id: size.product_id } });
    if (!product) throw new BadRequestException(`Product not found for size: ${dto.productSizeId}`);

    let total = parseFloat(product.base_price.toString()) + parseFloat(size.price_delta.toString());

    let frameOption: FrameOption | null = null;
    if (dto.frameOptionId) {
      frameOption = await this.frameOptionRepository.findOne({ where: { id: dto.frameOptionId } });
      if (!frameOption) throw new BadRequestException(`FrameOption not found: ${dto.frameOptionId}`);
      total += parseFloat(frameOption.price_delta.toString());
    }
    total = Math.round(total * 100) / 100;

    // ── ÉTAPE 2 ── Validation du designJson
    const design = dto.designJson as any;
    if (!design?.templateId || !Array.isArray(design?.layers)) {
      throw new BadRequestException('designJson must contain templateId and layers[]');
    }

    // ── ÉTAPE 3 ── Transaction atomique
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      // Créer la commande
      const order = manager.create(Order, {
        user_id: userId || null,
        guest_email: dto.guestEmail || null,
        status: 'pending_payment' as any,
        total_amount: total,
        shipping_address: JSON.stringify({
          firstName: dto.shippingFirstName,
          lastName: dto.shippingLastName,
          address: dto.shippingAddress,
          city: dto.shippingCity,
          postalCode: dto.shippingPostalCode,
          phone: dto.shippingPhone,
        }),
      });
      const savedOrder = await manager.save(Order, order);

      // Créer l'OrderItem avec design_json
      const item = manager.create(OrderItem, {
        order_id: savedOrder.id,
        product_id: product.id,
        product_size_id: size.id,
        frame_option_id: dto.frameOptionId || null,
        template_id: design.templateId,
        design_json: JSON.stringify(dto.designJson),
        preview_url: dto.previewUrl,
        unit_price: total,
        quantity: 1,
        subtotal: total,
      });
      const savedItem = await manager.save(OrderItem, item);

      // Créer le PrintJob
      const job = manager.create(PrintJob, {
        order_item_id: savedItem.id,
        status: 'queued',
        attempts: 0,
      });
      await manager.save(PrintJob, job);

      return savedOrder;
    });

    // ── ÉTAPE 4 ── Retour
    return {
      orderId: savedOrder.id,
      total,
      status: 'pending_payment',
    };
  }

  async getOrderById(orderId: string, userId?: string): Promise<any> {
    const where: any = { id: orderId };
    if (userId) where.user_id = userId;

    const order = await this.orderRepository.findOne({ where });
    if (!order) throw new BadRequestException('Order not found');

    const items = await this.orderItemRepository.find({ where: { order_id: orderId } });
    return { order, items };
  }

  async getUserOrders(userId: string): Promise<any[]> {
    return this.orderRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async cancelOrder(orderId: string, userId: string): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId, user_id: userId } });
    if (!order) throw new BadRequestException('Order not found');
    order.status = 'cancelled' as any;
    await this.orderRepository.save(order);
  }
}
