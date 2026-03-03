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
  ) {}

  async getAllProducts(): Promise<ProductListDto[]> {
    const products = await this.productRepository.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      base_price: parseFloat(product.base_price.toString()),
      image_url: product.image_url,
      is_active: product.is_active,
    }));
  }

  async getProductById(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id, is_active: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Fetch sizes and frames from seeded data
    // In a real app, these would be separate repositories
    const sizes = this.getProductSizes(product.id);
    const frameOptions = this.getFrameOptions();

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      base_price: parseFloat(product.base_price.toString()),
      category: product.category,
      image_url: product.image_url,
      is_active: product.is_active,
      created_at: product.created_at,
      sizes,
      frame_options: frameOptions,
    };
  }

  async getTemplates(): Promise<TemplateDto[]> {
    // Return seeded template data
    return [
      {
        id: 'template-1',
        name: 'Modern Minimalist',
        description: 'Clean and simple design template',
        category: 'modern',
        preview_url: '/templates/modern-minimalist.jpg',
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
        created_at: new Date(),
      },
      {
        id: 'template-2',
        name: 'Vibrant Colors',
        description: 'Colorful and energetic design template',
        category: 'vibrant',
        preview_url: '/templates/vibrant-colors.jpg',
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
        created_at: new Date(),
      },
      {
        id: 'template-3',
        name: 'Professional',
        description: 'Corporate and professional template',
        category: 'professional',
        preview_url: '/templates/professional.jpg',
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
        created_at: new Date(),
      },
    ];
  }

  private getProductSizes(productId: string) {
    // Return seeded size data based on product
    const sizeMap: Record<string, any[]> = {
      'product-1': [
        {
          id: 'size-1',
          product_id: 'product-1',
          name: 'Small',
          dimensions: '8x10 inches',
          price_modifier: 0,
        },
        {
          id: 'size-2',
          product_id: 'product-1',
          name: 'Medium',
          dimensions: '12x16 inches',
          price_modifier: 25,
        },
        {
          id: 'size-3',
          product_id: 'product-1',
          name: 'Large',
          dimensions: '16x20 inches',
          price_modifier: 50,
        },
      ],
      'product-2': [
        {
          id: 'size-4',
          product_id: 'product-2',
          name: 'A4',
          dimensions: '8.27x11.69 inches',
          price_modifier: 0,
        },
        {
          id: 'size-5',
          product_id: 'product-2',
          name: 'A3',
          dimensions: '11.69x16.54 inches',
          price_modifier: 15,
        },
      ],
      'product-3': [
        {
          id: 'size-6',
          product_id: 'product-3',
          name: 'Square',
          dimensions: '12x12 inches',
          price_modifier: 10,
        },
        {
          id: 'size-7',
          product_id: 'product-3',
          name: 'Rectangle',
          dimensions: '16x12 inches',
          price_modifier: 20,
        },
      ],
    };

    return sizeMap[productId] || [];
  }

  private getFrameOptions() {
    return [
      {
        id: 'frame-1',
        name: 'No Frame',
        description: 'Without frame',
        price_modifier: 0,
      },
      {
        id: 'frame-2',
        name: 'Black Frame',
        description: 'Modern black wooden frame',
        price_modifier: 25,
      },
      {
        id: 'frame-3',
        name: 'White Frame',
        description: 'Clean white wooden frame',
        price_modifier: 25,
      },
      {
        id: 'frame-4',
        name: 'Gold Frame',
        description: 'Elegant gold metal frame',
        price_modifier: 40,
      },
    ];
  }
}
