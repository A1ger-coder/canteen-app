-- ============================================================
-- QuickBite — Add Feedback Table & Update Orders for Cancellation
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Drop ALL status check constraints on orders table
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'orders'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE orders DROP CONSTRAINT ' || r.conname;
  END LOOP;
END $$;

-- 2. Re-add with 'cancelled' included
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'));

-- 3. Create Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 5. Allow public access to feedback (drop first if they already exist)
DROP POLICY IF EXISTS "Public can create feedback" ON feedback;
CREATE POLICY "Public can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view feedback" ON feedback;
CREATE POLICY "Public can view feedback"
  ON feedback FOR SELECT
  USING (true);
