import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto, ProductListDto, TemplateDto } from './products.dto';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProducts(): Promise<ProductListDto[]> {
    return this.productsService.getAllProducts();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProduct(@Param('id') id: string): Promise<ProductDto> {
    return this.productsService.getProductById(id);
  }

  @Get('templates/all')
  @HttpCode(HttpStatus.OK)
  async getTemplates(): Promise<TemplateDto[]> {
    return this.productsService.getTemplates();
  }
}
