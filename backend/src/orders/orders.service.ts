import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { PrintJob } from './print-job.entity';
import { Product } from '../products/product.entity';
import { ProductSize } from '../products/entities/product-size.entity';
import { FrameOption } from '../products/entities/frame-option.entity';
import { CreateOrderDto, OrderCreatedResponseDto } from './dto/create-order.dto';
import { EmailService } from '../email/email.service';

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
    private readonly emailService: EmailService,
  ) { }

  async createOrder(dto: CreateOrderDto, userId?: string): Promise<OrderCreatedResponseDto> {
    // ── ÉTAPE 1 ── Recalcul du prix côté backend
    const size = await this.productSizeRepository.findOneOrFail({ where: { id: dto.productSizeId } }).catch(() => {
      throw new BadRequestException(`ProductSize not found: ${dto.productSizeId}`);
    });

    const product = await this.productRepository.findOneOrFail({ where: { id: size.productId } }).catch(() => {
      throw new BadRequestException(`Product not found for size: ${dto.productSizeId}`);
    });

    let total = parseFloat(product.basePrice.toString()) + parseFloat(size.priceDelta.toString());

    if (dto.frameOptionId) {
      const frame = await this.frameOptionRepository.findOneOrFail({ where: { id: dto.frameOptionId } }).catch(() => {
        throw new BadRequestException(`FrameOption not found: ${dto.frameOptionId}`);
      });
      total += parseFloat(frame.priceDelta.toString());
    }
    total = Math.round(total * 100) / 100;

    // ── ÉTAPE 2 ── Validation du designJson
    const design = dto.designJson as any;
    if (!design || !design.templateId || !Array.isArray(design.layers)) {
      throw new BadRequestException('designJson must contain templateId and layers[]');
    }

    // ── ÉTAPE 3 ── Transaction PostgreSQL atomique
    const savedOrder = await this.dataSource.transaction(async (manager) => {

      // Créer la commande
      const order = manager.create(Order, {
        userId: userId || null,
        guestEmail: dto.guestEmail || null,
        status: OrderStatus.PENDING_PAYMENT,
        total,
        shippingAddr: {
          firstName: dto.shippingFirstName,
          lastName: dto.shippingLastName,
          address: dto.shippingAddress,
          city: dto.shippingCity,
          postalCode: dto.shippingPostalCode,
          phone: dto.shippingPhone
        }
      });
      const savedOrder = await manager.save(Order, order);

      // Créer l'order item
      const item = manager.create(OrderItem, {
        orderId: savedOrder.id,
        productId: product.id,
        productSizeId: size.id,
        frameOptionId: dto.frameOptionId || null,
        templateId: design.templateId,
        designJson: dto.designJson,
        previewUrl: dto.previewUrl,
        unitPrice: total,
        quantity: 1
      });
      await manager.save(OrderItem, item);

      // Créer le print job
      const job = manager.create(PrintJob, {
        orderItemId: item.id,
        status: 'queued',
        attempts: 0
      });
      await manager.save(PrintJob, job);

      return savedOrder;
    });

    // ── ÉTAPE 4 ── Send order confirmation email (non-blocking)
    const recipientEmail = dto.guestEmail || null;
    if (recipientEmail) {
      this.emailService.sendOrderConfirmation(savedOrder, recipientEmail).catch(() => { });
    }

    // ── ÉTAPE 5 ── Retour
    return {
      orderId: savedOrder.id,
      total,
      status: 'pending_payment',
    };
  }

  async getOrderById(orderId: string, userId?: string): Promise<any> {
    const where: any = { id: orderId };
    if (userId) where.userId = userId;

    const order = await this.orderRepository.findOne({ where });
    if (!order) throw new BadRequestException('Order not found');

    const items = await this.orderItemRepository.find({ where: { orderId: orderId } });
    return { order, items };
  }

  async getUserOrders(userId: string): Promise<any[]> {
    return this.orderRepository.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelOrder(orderId: string, userId: string): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId, userId: userId } });
    if (!order) throw new BadRequestException('Order not found');
    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);
  }

  async updateOrderStatus(orderId: string, options: { status: string }): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');
    order.status = options.status as any;
    await this.orderRepository.save(order);
  }
}
