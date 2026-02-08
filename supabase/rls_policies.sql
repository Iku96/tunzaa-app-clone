-- RLS Policies for Supabase

-- 1. Profiles: Users can read all (needed for Merchant Pulse/Buying), but only update their own.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Products: Everyone can read active products. Only merchants can insert/update their own.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Merchants can insert own products" 
ON products FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Merchants can update own products" 
ON products FOR UPDATE 
USING (auth.uid() = vendor_id);

-- 3. Goals: Users can see their own goals. 
-- Merchants can see goals linked to their products (for the Pulse dashboard).
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own goals" 
ON goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Merchants can see goals for their products" 
ON goals FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM products 
    WHERE products.id = goals.product_id 
    AND products.vendor_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own goals" 
ON goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
ON goals FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Transactions: Users see their own. Merchants see payments for their products.
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own transactions" 
ON transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM goals 
    WHERE goals.id = transactions.goal_id 
    AND goals.user_id = auth.uid()
  )
);

CREATE POLICY "Merchants can see transactions for their products" 
ON transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM goals 
    JOIN products ON products.id = goals.product_id
    WHERE goals.id = transactions.goal_id 
    AND products.vendor_id = auth.uid()
  )
);
