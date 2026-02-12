-- =====================================================
-- TUNZAA DATABASE SCHEMA
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: ENUMS & TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('buyer', 'merchant', 'admin');
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed', 'fulfilled', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('deposit', 'allocation', 'payment', 'refund', 'fee', 'payout');
CREATE TYPE currency_code AS ENUM ('TZS', 'USD');
CREATE TYPE payment_frequency AS ENUM ('daily', 'weekly', 'monthly');

-- =====================================================
-- PART 2: TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'buyer',
    full_name TEXT,
    phone_number TEXT UNIQUE,
    avatar_url TEXT,
    business_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    gender TEXT,
    date_of_birth DATE,
    preferred_location TEXT,
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table (for creators/merchants)
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    category TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interests table
CREATE TABLE interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User interests junction table
CREATE TABLE user_interests (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, interest_id)
);

-- Followers table (users following businesses)
CREATE TABLE followers (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    currency currency_code DEFAULT 'TZS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- Goals table (layaway/saving goals)
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    deadline_date TIMESTAMPTZ NOT NULL,
    payment_frequency payment_frequency NOT NULL,
    status goal_status DEFAULT 'active',
    cancellation_fee_snapshot DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ledger entries table (double-entry accounting)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 3: INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_phone ON profiles(phone_number);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_user_interests_user ON user_interests(user_id);
CREATE INDEX idx_user_interests_interest ON user_interests(interest_id);
CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);
CREATE INDEX idx_products_merchant ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_ledger_wallet ON ledger_entries(wallet_id);
CREATE INDEX idx_ledger_goal ON ledger_entries(goal_id);

-- =====================================================
-- PART 4: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Anyone can view active businesses"
    ON businesses FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage their businesses"
    ON businesses FOR ALL
    USING (auth.uid() = owner_id);

-- Interests policies
CREATE POLICY "Anyone can view interests"
    ON interests FOR SELECT
    USING (true);

-- User interests policies
CREATE POLICY "Users can view their own interests"
    ON user_interests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests"
    ON user_interests FOR ALL
    USING (auth.uid() = user_id);

-- Followers policies
CREATE POLICY "Users can view their followings"
    ON followers FOR SELECT
    USING (auth.uid() = follower_id);

CREATE POLICY "Users can manage their followings"
    ON followers FOR ALL
    USING (auth.uid() = follower_id);

-- Products policies
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Merchants can manage their products"
    ON products FOR ALL
    USING (auth.uid() = merchant_id);

-- Wallets policies
CREATE POLICY "Users can view their own wallets"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wallets"
    ON wallets FOR ALL
    USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view their own goals"
    ON goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
    ON goals FOR ALL
    USING (auth.uid() = user_id);

-- Ledger entries policies
CREATE POLICY "Users can view their own ledger entries"
    ON ledger_entries FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM wallets WHERE id = wallet_id
    ));

CREATE POLICY "Users can create ledger entries for their wallets"
    ON ledger_entries FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM wallets WHERE id = wallet_id
    ));

-- =====================================================
-- PART 5: FUNCTIONS
-- =====================================================

-- Function to get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(wallet_id_param UUID)
RETURNS DECIMAL AS $$
    SELECT COALESCE(SUM(amount), 0)
    FROM ledger_entries
    WHERE wallet_id = wallet_id_param;
$$ LANGUAGE SQL STABLE;

-- Function to handle new user signup (create profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, role)
    VALUES (NEW.id, 'buyer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to create default wallet for new users
CREATE OR REPLACE FUNCTION create_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, currency)
    VALUES (NEW.id, 'TZS');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet when profile is created
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_wallet();

-- Function to process payment
CREATE OR REPLACE FUNCTION process_payment(
    goal_id_param UUID,
    amount_param DECIMAL,
    reference_id_param TEXT
)
RETURNS JSON AS $$
DECLARE
    v_goal goals%ROWTYPE;
    v_wallet_id UUID;
    v_new_balance DECIMAL;
    v_is_completed BOOLEAN := false;
BEGIN
    -- Get goal details
    SELECT * INTO v_goal FROM goals WHERE id = goal_id_param AND status = 'active';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Goal not found or not active';
    END IF;
    
    -- Get wallet
    SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_goal.user_id;
    
    -- Record payment in ledger
    INSERT INTO ledger_entries (wallet_id, goal_id, type, amount, description, reference_id)
    VALUES (v_wallet_id, goal_id_param, 'payment', -amount_param, 'Goal payment', reference_id_param);
    
    -- Update goal
    UPDATE goals
    SET current_amount = current_amount + amount_param,
        status = CASE
            WHEN current_amount + amount_param >= target_amount THEN 'completed'::goal_status
            ELSE status
        END
    WHERE id = goal_id_param
    RETURNING current_amount >= target_amount INTO v_is_completed;
    
    -- Get new balance
    v_new_balance := get_wallet_balance(v_wallet_id);
    
    RETURN json_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'is_completed', v_is_completed
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel goal with fee
CREATE OR REPLACE FUNCTION cancel_goal(goal_id_param UUID)
RETURNS JSON AS $$
DECLARE
    v_goal goals%ROWTYPE;
    v_wallet_id UUID;
    v_refund_amount DECIMAL;
    v_fee_amount DECIMAL;
BEGIN
    SELECT * INTO v_goal FROM goals WHERE id = goal_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Goal not found';
    END IF;
    
    -- Calculate fee and refund
    v_fee_amount := v_goal.current_amount * v_goal.cancellation_fee_snapshot;
    v_refund_amount := v_goal.current_amount - v_fee_amount;
    
    -- Get wallet
    SELECT id INTO v_wallet_id FROM wallets WHERE user_id = v_goal.user_id;
    
    -- Record refund
    IF v_refund_amount > 0 THEN
        INSERT INTO ledger_entries (wallet_id, goal_id, type, amount, description)
        VALUES (v_wallet_id, goal_id_param, 'refund', v_refund_amount, 'Goal cancellation refund');
    END IF;
    
    -- Record fee
    IF v_fee_amount > 0 THEN
        INSERT INTO ledger_entries (wallet_id, goal_id, type, amount, description)
        VALUES (v_wallet_id, goal_id_param, 'fee', -v_fee_amount, 'Cancellation fee');
    END IF;
    
    -- Update goal status
    UPDATE goals SET status = 'cancelled' WHERE id = goal_id_param;
    
    RETURN json_build_object(
        'success', true,
        'refund_amount', v_refund_amount,
        'fee_amount', v_fee_amount
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
