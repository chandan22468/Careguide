export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  isDemo?: boolean;
}
