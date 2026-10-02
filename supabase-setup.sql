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
  image TEXT DEFAULT '/images/placeholder.jpg',
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

-- 8. Seed data — Indian canteen menu items
INSERT INTO menu_items (name, description, price, category, image, is_veg, is_available, preparation_time) VALUES
  ('Samosa', 'Crispy golden pastry filled with spiced potatoes and peas. Served with mint chutney.', 20, 'snacks', '/images/samosa.jpg', true, true, 5),
  ('Vada Pav', 'Mumbai-style spiced potato fritter in a soft bun with chutneys.', 25, 'snacks', '/images/vadapav.jpg', true, true, 5),
  ('Paneer Puff', 'Flaky puff pastry stuffed with spiced paneer and vegetables.', 30, 'snacks', '/images/paneerpuff.jpg', true, true, 5),
  ('Chicken Roll', 'Tender chicken wrapped in a warm paratha with onions and sauces.', 60, 'snacks', '/images/chickenroll.jpg', false, true, 10),
  ('French Fries', 'Crispy golden fries seasoned with herbs and spices. Served with ketchup.', 50, 'snacks', '/images/fries.jpg', true, true, 8),
  ('Spring Roll', 'Crunchy vegetable spring rolls with sweet chili dipping sauce.', 40, 'snacks', '/images/springroll.jpg', true, true, 7),
  ('Masala Chai', 'Aromatic Indian tea brewed with ginger, cardamom, and fresh milk.', 15, 'beverages', '/images/chai.jpg', true, true, 3),
  ('Cold Coffee', 'Rich and creamy blended cold coffee topped with whipped cream.', 50, 'beverages', '/images/coldcoffee.jpg', true, true, 5),
  ('Fresh Lime Soda', 'Refreshing lime juice with soda, mint, and a hint of black salt.', 30, 'beverages', '/images/limesoda.jpg', true, true, 3),
  ('Mango Lassi', 'Thick and creamy yogurt smoothie blended with ripe Alphonso mangoes.', 45, 'beverages', '/images/mangolassi.jpg', true, true, 4),
  ('Buttermilk', 'Cool, spiced buttermilk with cumin and curry leaves.', 20, 'beverages', '/images/buttermilk.jpg', true, true, 2),
  ('Veg Thali', 'Complete meal with dal, sabzi, rice, roti, salad, and pickle.', 90, 'meals', '/images/vegthali.jpg', true, true, 15),
  ('Chicken Biryani', 'Fragrant basmati rice layered with tender spiced chicken and saffron.', 120, 'meals', '/images/biryani.jpg', false, true, 20),
  ('Paneer Butter Masala + Naan', 'Rich and creamy paneer curry served with soft butter naan.', 110, 'meals', '/images/paneermasala.jpg', true, true, 15),
  ('Egg Fried Rice', 'Wok-tossed rice with eggs, vegetables, and Indo-Chinese seasonings.', 70, 'meals', '/images/eggfriedrice.jpg', false, true, 12),
  ('Chole Bhature', 'Spicy chickpea curry with fluffy deep-fried bread.', 80, 'meals', '/images/cholebhature.jpg', true, true, 12),
  ('Rajma Chawal', 'Hearty kidney bean curry served with steamed basmati rice.', 75, 'meals', '/images/rajmachawal.jpg', true, true, 15),
  ('Gulab Jamun', 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup. (2 pcs)', 30, 'desserts', '/images/gulabjamun.jpg', true, true, 3),
  ('Chocolate Brownie', 'Warm, fudgy brownie with a molten chocolate center.', 50, 'desserts', '/images/brownie.jpg', true, true, 5),
  ('Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce, nuts, and a cherry on top.', 60, 'desserts', '/images/sundae.jpg', true, true, 4),
  ('Rasgulla', 'Spongy cottage cheese balls in light sugar syrup. (2 pcs)', 25, 'desserts', '/images/rasgulla.jpg', true, true, 3);
