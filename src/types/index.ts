// ============================================================
// Core Types for Canteen QR Food Ordering App
// ============================================================

export type Category = 'snacks' | 'beverages' | 'meals' | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number; // in minutes
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked_up';

export type PaymentMethod = 'upi' | 'card' | 'counter';

export type PaymentStatus = 'pending' | 'paid';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface CartState {
  items: CartItem[];
  tableNumber: number | null;
}

export interface AdminUser {
  isAuthenticated: boolean;
}
