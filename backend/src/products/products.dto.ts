export class ProductSizeDto {
  id: string;
  productId: string;
  label: string;
  widthCm: number;
  heightCm: number;
  priceDelta: number;
  active: boolean;
}

export class FrameOptionDto {
  id: string;
  productId: string;
  label: string;
  colorHex: string;
  material: string;
  priceDelta: number;
  active: boolean;
}

export class ProductDto {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  sizes: ProductSizeDto[];
  frameOptions: FrameOptionDto[];
}

export class ProductListDto {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  isActive: boolean;
}

export class TemplateDto {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  definition: Record<string, any>;
  createdAt: Date;
}
