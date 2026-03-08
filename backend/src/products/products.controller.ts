import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto, ProductListDto, TemplateDto } from './products.dto';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProducts(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ products: ProductListDto[]; total: number }> {
    return this.productsService.getAllProducts({
      category,
      minPrice,
      maxPrice,
      search,
      sortBy,
      page,
      limit,
    });
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getCategories(): Promise<string[]> {
    return this.productsService.getCategories();
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
