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

  async getAllProducts(): Promise<ProductListDto[]> {
    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      basePrice: parseFloat(product.basePrice.toString()),
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    }));
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
      basePrice: parseFloat(product.basePrice.toString()),
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
      sizes,
      frameOptions: frames,
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
