export class ProductSizeDto {
  id: string;
  product_id: string;
  name: string;
  dimensions: string;
  price_modifier: number;
}

export class FrameOptionDto {
  id: string;
  name: string;
  description: string;
  price_modifier: number;
}

export class ProductDto {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: Date;
  sizes: ProductSizeDto[];
  frame_options: FrameOptionDto[];
}

export class ProductListDto {
  id: string;
  name: string;
  category: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
}

export class TemplateDto {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_url: string;
  definition: Record<string, any>;
  created_at: Date;
}
