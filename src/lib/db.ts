// ============================================================
// Database layer — Supabase (PostgreSQL)
// Replaces the JSON file-based database for production use
// ============================================================

import { supabase } from './supabase';
import { MenuItem, Order, OrderItem, Feedback } from '@/types';

// ---- Menu operations ----

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name');

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return (data || []).map(mapDbToMenuItem);
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapDbToMenuItem(data);
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      is_veg: item.isVeg,
      is_available: item.isAvailable,
      preparation_time: item.preparationTime,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding menu item:', error);
    return null;
  }

  return mapDbToMenuItem(data);
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
  // Map camelCase fields to snake_case DB columns
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.image !== undefined) dbUpdates.image = updates.image;
  if (updates.isVeg !== undefined) dbUpdates.is_veg = updates.isVeg;
  if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
  if (updates.preparationTime !== undefined) dbUpdates.preparation_time = updates.preparationTime;

  const { data, error } = await supabase
    .from('menu_items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating menu item:', error);
    return null;
  }

  return mapDbToMenuItem(data);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }

  return true;
}

// ---- Memory Store Fallback for local testing or before DB migration ----
const memoryOrders = new Map<string, Order>();
const memoryFeedback = new Map<string, Feedback>();

// ---- Order operations ----

export async function getOrders(): Promise<Order[]> {
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (ordersError || !ordersData) {
    console.warn('Supabase getOrders failed or empty, returning memory orders:', ordersError?.message);
    return Array.from(memoryOrders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Fetch order items for all orders
  const orderIds = ordersData.map((o) => o.id);
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
  }

  const itemsByOrderId = new Map<string, OrderItem[]>();
  for (const item of itemsData || []) {
    const orderId = item.order_id;
    if (!itemsByOrderId.has(orderId)) {
      itemsByOrderId.set(orderId, []);
    }
    itemsByOrderId.get(orderId)!.push({
      menuItemId: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      specialInstructions: item.special_instructions || '',
    });
  }

  const result = ordersData.map((o) => mapDbToOrder(o, itemsByOrderId.get(o.id) || []));
  // Sync to memory
  result.forEach((o) => memoryOrders.set(o.id, o));
  return result;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError || !orderData) {
    return memoryOrders.get(id) || null;
  }

  const { data: itemsData } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const items: OrderItem[] = (itemsData || []).map((item) => ({
    menuItemId: item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    specialInstructions: item.special_instructions || '',
  }));

  const order = mapDbToOrder(orderData, items);
  memoryOrders.set(order.id, order);
  return order;
}

export async function createOrder(orderInput: {
  tableNumber: number;
  items: OrderItem[];
  total: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
}): Promise<Order | null> {
  // Insert the order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_number: orderInput.tableNumber,
      total: orderInput.total,
      customer_name: orderInput.customerName || 'Guest',
      customer_phone: orderInput.customerPhone || '',
      payment_method: orderInput.paymentMethod,
      payment_status: orderInput.paymentMethod === 'counter' ? 'pending' : 'paid',
      status: 'placed',
    })
    .select()
    .single();

  if (orderError || !orderData) {
    console.warn('Supabase createOrder failed, creating in memory store:', orderError?.message);
    const newId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      id: newId,
      tableNumber: orderInput.tableNumber,
      items: orderInput.items,
      total: orderInput.total,
      status: 'placed',
      customerName: orderInput.customerName || 'Guest',
      customerPhone: orderInput.customerPhone || '',
      paymentMethod: orderInput.paymentMethod as Order['paymentMethod'],
      paymentStatus: orderInput.paymentMethod === 'counter' ? 'pending' : 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryOrders.set(newId, newOrder);
    return newOrder;
  }

  // Insert order items
  const orderItems = orderInput.items.map((item) => ({
    order_id: orderData.id,
    menu_item_id: item.menuItemId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    special_instructions: item.specialInstructions || '',
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
  }

  const order = mapDbToOrder(orderData, orderInput.items);
  memoryOrders.set(order.id, order);
  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;

  const { data, error } = await supabase
    .from('orders')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.warn('Supabase updateOrder failed, updating memory store:', error?.message);
    const existing = memoryOrders.get(id);
    if (!existing) return null;
    const updated: Order = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    memoryOrders.set(id, updated);
    return updated;
  }

  // Fetch items for the response
  const { data: itemsData } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const items: OrderItem[] = (itemsData || []).map((item) => ({
    menuItemId: item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    specialInstructions: item.special_instructions || '',
  }));

  const order = mapDbToOrder(data, items);
  memoryOrders.set(id, order);
  return order;
}

// ---- Cancel order ----

export async function cancelOrder(id: string): Promise<Order | null> {
  // First check if the order can be cancelled (only 'placed' or 'confirmed')
  const order = await getOrderById(id);
  if (!order) return null;

  if (order.status !== 'placed' && order.status !== 'confirmed') {
    return null; // Cannot cancel once preparing has started
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.warn('Supabase cancelOrder failed, updating in memory store:', error?.message);
    const updated: Order = {
      ...order,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    memoryOrders.set(id, updated);
    return updated;
  }

  // Fetch items for the response
  const { data: itemsData } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const items: OrderItem[] = (itemsData || []).map((item) => ({
    menuItemId: item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    specialInstructions: item.special_instructions || '',
  }));

  const cancelledOrder = mapDbToOrder(data, items);
  memoryOrders.set(id, cancelledOrder);
  return cancelledOrder;
}

// ---- Feedback operations ----

export async function submitFeedback(feedback: {
  orderId: string;
  rating: number;
  comment: string;
}): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      order_id: feedback.orderId,
      rating: feedback.rating,
      comment: feedback.comment,
    })
    .select()
    .single();

  if (error || !data) {
    console.warn('Supabase submitFeedback failed, saving to memory store:', error?.message);
    const fbObj: Feedback = {
      id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: feedback.orderId,
      rating: feedback.rating,
      comment: feedback.comment || '',
      createdAt: new Date().toISOString(),
    };
    memoryFeedback.set(feedback.orderId, fbObj);
    return fbObj;
  }

  const fb = mapDbToFeedback(data);
  memoryFeedback.set(feedback.orderId, fb);
  return fb;
}

export async function getFeedbackByOrderId(orderId: string): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error || !data) {
    return memoryFeedback.get(orderId) || null;
  }

  const fb = mapDbToFeedback(data);
  memoryFeedback.set(orderId, fb);
  return fb;
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return Array.from(memoryFeedback.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const list = data.map(mapDbToFeedback);
  list.forEach((fb) => memoryFeedback.set(fb.orderId, fb));
  return list;
}


// ---- Admin auth ----
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

export function verifyAdminPin(pin: string): boolean {
  return pin === ADMIN_PIN;
}

// ---- Mappers (snake_case DB → camelCase App) ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    category: row.category,
    image: row.image || '',
    isVeg: row.is_veg,
    isAvailable: row.is_available,
    preparationTime: row.preparation_time || 10,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToOrder(row: any, items: OrderItem[]): Order {
  return {
    id: row.id,
    tableNumber: row.table_number,
    items,
    status: row.status,
    total: Number(row.total),
    customerName: row.customer_name || 'Guest',
    customerPhone: row.customer_phone || '',
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToFeedback(row: any): Feedback {
  return {
    id: row.id,
    orderId: row.order_id,
    rating: row.rating,
    comment: row.comment || '',
    createdAt: row.created_at,
  };
}
