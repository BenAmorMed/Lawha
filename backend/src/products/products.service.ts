import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductDto, ProductListDto, TemplateDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async getAllProducts(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductListDto[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true });

    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.minPrice) {
      query.andWhere('product.currentPrice >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice) {
      query.andWhere('product.currentPrice <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters?.search) {
      query.andWhere('product.name ILIKE :search', { search: `%${filters.search}%` });
    }

    const sortBy = filters?.sortBy || 'newest';
    switch (sortBy) {
      case 'priceLowHigh':
        query.orderBy('product.currentPrice', 'ASC');
        break;
      case 'priceHighLow':
        query.orderBy('product.currentPrice', 'DESC');
        break;
      case 'popular':
        query.orderBy('product.reviewsCount', 'DESC');
        break;
      case 'rating':
        query.orderBy('product.rating', 'DESC');
        break;
      case 'newest':
      default:
        query.orderBy('product.createdAt', 'DESC');
        break;
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined,
        currentPrice: parseFloat(product.currentPrice.toString()),
        imageUrl: product.imageUrl,
        rating: parseFloat(product.rating.toString()),
        reviewsCount: product.reviewsCount,
        isSpecial: product.isSpecial,
        shippingFree: product.shippingFree,
        isActive: product.isActive,
      })),
      total,
    };
  }

  async getProductById(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['sizes', 'frames'],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Remapper to match the DTO if needed
    const sizes = product.sizes?.map(size => ({
      ...size,
      priceDelta: parseFloat(size.priceDelta.toString()),
      widthCm: parseFloat(size.widthCm.toString()),
      heightCm: parseFloat(size.heightCm.toString())
    })) || [];

    const frames = product.frames?.map(frame => ({
      ...frame,
      priceDelta: parseFloat(frame.priceDelta.toString())
    })) || [];

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.toString()) : undefined,
      currentPrice: parseFloat(product.currentPrice.toString()),
      category: product.category,
      imageUrl: product.imageUrl,
      images: product.images,
      rating: parseFloat(product.rating.toString()),
      reviewsCount: product.reviewsCount,
      isSpecial: product.isSpecial,
      shippingFree: product.shippingFree,
      isActive: product.isActive,
      createdAt: product.createdAt,
      sizes,
      frameOptions: frames,
    };
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .getRawMany();

    return categories.map(c => c.category);
  }

  async getTemplates(): Promise<TemplateDto[]> {
    // Return seeded template data
    return [
      {
        id: 'template-1',
        name: 'Modern Minimalist',
        description: 'Clean and simple design template',
        category: 'modern',
        previewUrl: '/templates/modern-minimalist.jpg',
        definition: {
          width: 800,
          height: 600,
          layers: [
            {
              id: 'background',
              type: 'rect',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
              fill: '#FFFFFF',
            },
            {
              id: 'text-area',
              type: 'text',
              x: 50,
              y: 50,
              width: 700,
              height: 500,
              fontSize: 48,
              fontFamily: 'Arial',
              fill: '#000000',
            },
          ],
        },
        createdAt: new Date(),
      },
      {
        id: 'template-2',
        name: 'Vibrant Colors',
        description: 'Colorful and energetic design template',
        category: 'vibrant',
        previewUrl: '/templates/vibrant-colors.jpg',
        definition: {
          width: 800,
          height: 600,
          layers: [
            {
              id: 'gradient-bg',
              type: 'rect',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
              fill: '#FF6B6B',
            },
            {
              id: 'accent',
              type: 'circle',
              cx: 400,
              cy: 300,
              radius: 150,
              fill: '#4ECDC4',
            },
          ],
        },
        createdAt: new Date(),
      },
      {
        id: 'template-3',
        name: 'Professional',
        description: 'Corporate and professional template',
        category: 'professional',
        previewUrl: '/templates/professional.jpg',
        definition: {
          width: 800,
          height: 600,
          layers: [
            {
              id: 'background',
              type: 'rect',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
              fill: '#F5F5F5',
            },
            {
              id: 'header',
              type: 'rect',
              x: 0,
              y: 0,
              width: 800,
              height: 150,
              fill: '#1F1F1F',
            },
          ],
        },
        createdAt: new Date(),
      },
    ];
  }

}
