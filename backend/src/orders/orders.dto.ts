export class CreateOrderItemDto {
  product_id: string;
  quantity: number;
  size_selected?: string;
  frame_option?: string;
}

export class CreateOrderDto {
  items: CreateOrderItemDto[];
  shipping_address: string;
}

export class OrderItemResponseDto {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size_selected: string;
  frame_option: string;
  subtotal: number;
  created_at: Date;
}

export class OrderResponseDto {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  tracking_number: string;
  items: OrderItemResponseDto[];
  created_at: Date;
  updated_at: Date;
}

export class OrderListDto {
  id: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: Date;
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
