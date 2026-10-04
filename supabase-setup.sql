-- ============================================================
-- QuickBite Canteen — Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('snacks', 'beverages', 'meals', 'desserts')),
  image TEXT DEFAULT '',
  is_veg BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER DEFAULT 0,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready', 'picked_up')),
  total NUMERIC DEFAULT 0,
  customer_name TEXT DEFAULT 'Guest',
  customer_phone TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'counter' CHECK (payment_method IN ('upi', 'card', 'counter')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order Items Table (junction table)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  special_instructions TEXT DEFAULT ''
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. Allow public read access to menu_items
CREATE POLICY "Public can view menu items"
  ON menu_items FOR SELECT
  USING (true);

-- 6. Allow public to create orders and order items
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Public can update orders"
  ON orders FOR UPDATE
  USING (true);

CREATE POLICY "Public can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view order items"
  ON order_items FOR SELECT
  USING (true);

-- 7. Allow all operations on menu_items (admin manages via app PIN)
CREATE POLICY "Admin can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update menu items"
  ON menu_items FOR UPDATE
  USING (true);

CREATE POLICY "Admin can delete menu items"
  ON menu_items FOR DELETE
  USING (true);

-- 8. Seed data — Indian canteen menu items with real food images
INSERT INTO menu_items (name, description, price, category, image, is_veg, is_available, preparation_time) VALUES
  ('Samosa', 'Crispy golden pastry filled with spiced potatoes and peas. Served with mint chutney.', 20, 'snacks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, true, 5),
  ('Vada Pav', 'Mumbai-style spiced potato fritter in a soft bun with chutneys.', 25, 'snacks', 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&h=300&fit=crop', true, true, 5),
  ('Paneer Puff', 'Flaky puff pastry stuffed with spiced paneer and vegetables.', 30, 'snacks', 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400&h=300&fit=crop', true, true, 5),
  ('Chicken Roll', 'Tender chicken wrapped in a warm paratha with onions and sauces.', 60, 'snacks', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', false, true, 10),
  ('French Fries', 'Crispy golden fries seasoned with herbs and spices. Served with ketchup.', 50, 'snacks', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', true, true, 8),
  ('Spring Roll', 'Crunchy vegetable spring rolls with sweet chili dipping sauce.', 40, 'snacks', 'https://images.unsplash.com/photo-1548507200-68a671a19b53?w=400&h=300&fit=crop', true, true, 7),
  ('Masala Chai', 'Aromatic Indian tea brewed with ginger, cardamom, and fresh milk.', 15, 'beverages', 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop', true, true, 3),
  ('Cold Coffee', 'Rich and creamy blended cold coffee topped with whipped cream.', 50, 'beverages', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', true, true, 5),
  ('Fresh Lime Soda', 'Refreshing lime juice with soda, mint, and a hint of black salt.', 30, 'beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop', true, true, 3),
  ('Mango Lassi', 'Thick and creamy yogurt smoothie blended with ripe Alphonso mangoes.', 45, 'beverages', 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop', true, true, 4),
  ('Buttermilk', 'Cool, spiced buttermilk with cumin and curry leaves.', 20, 'beverages', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', true, true, 2),
  ('Veg Thali', 'Complete meal with dal, sabzi, rice, roti, salad, and pickle.', 90, 'meals', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop', true, true, 15),
  ('Chicken Biryani', 'Fragrant basmati rice layered with tender spiced chicken and saffron.', 120, 'meals', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', false, true, 20),
  ('Paneer Butter Masala + Naan', 'Rich and creamy paneer curry served with soft butter naan.', 110, 'meals', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', true, true, 15),
  ('Egg Fried Rice', 'Wok-tossed rice with eggs, vegetables, and Indo-Chinese seasonings.', 70, 'meals', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', false, true, 12),
  ('Chole Bhature', 'Spicy chickpea curry with fluffy deep-fried bread.', 80, 'meals', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&h=300&fit=crop', true, true, 12),
  ('Rajma Chawal', 'Hearty kidney bean curry served with steamed basmati rice.', 75, 'meals', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop', true, true, 15),
  ('Gulab Jamun', 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup. (2 pcs)', 30, 'desserts', 'https://images.unsplash.com/photo-1666190050091-63f1726d1931?w=400&h=300&fit=crop', true, true, 3),
  ('Chocolate Brownie', 'Warm, fudgy brownie with a molten chocolate center.', 50, 'desserts', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', true, true, 5),
  ('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce, nuts, and a cherry on top.', 60, 'desserts', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop', true, true, 4),
  ('Rasgulla', 'Spongy cottage cheese balls in light sugar syrup. (2 pcs)', 25, 'desserts', 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&h=300&fit=crop', true, true, 3);
