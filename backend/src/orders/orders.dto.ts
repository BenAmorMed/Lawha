export class CreateOrderItemDto {
  productId: string;
  quantity: number;
  sizeSelected?: string;
  frameOption?: string;
}

export class CreateOrderDto {
  items: CreateOrderItemDto[];
  shipping_address: string;
}

export class OrderItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  unit_price: number;
  sizeSelected: string;
  frameOption: string;
  subtotal: number;
  createdAt: Date;
}

export class OrderResponseDto {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: string;
  tracking_number: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderListDto {
  id: string;
  status: string;
  total: number;
  items_count: number;
  createdAt: Date;
  shipped_at: Date;
}

export class UpdateOrderStatusDto {
  status: 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
}

export class OrderPriceBreakdownDto {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}
