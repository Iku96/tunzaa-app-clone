-- =====================================================
-- SEED DATA FOR TESTING
-- Run this AFTER 001_initial_schema.sql
-- =====================================================

-- Insert interests
INSERT INTO interests (name) VALUES
    ('Gaming'),
    ('Baby & Kids Products'),
    ('Groceries & Daily Needs'),
    ('Travel'),
    ('Loan & Financing Options'),
    ('Event & Travel Tickets'),
    ('Books'),
    ('Deals & Discounts'),
    ('Automotive'),
    ('Fashion & Apparel'),
    ('Electronics'),
    ('Home & Garden');

-- Insert sample businesses (creators)
INSERT INTO businesses (owner_id, name, description, category) VALUES
    -- Note: Replace owner_id with actual user IDs after creating test accounts
    -- For now, these are placeholders
    (NULL, 'Tunzaa shop', 'Official Tunzaa marketplace', 'Electronics'),
    (NULL, 'Vodacom Shop', 'Telecommunications and devices', 'Telecom'),
    (NULL, 'GSM shop', 'Mobile phones and accessories', 'Electronics'),
    (NULL, 'Mama dee', 'Fashion and lifestyle creator', 'Fashion'),
    (NULL, 'Mamie shop', 'Home goods and groceries', 'Groceries'),
    (NULL, 'July Street', 'Street fashion and urban wear', 'Fashion'),
    (NULL, 'Gadget Vee shop', 'Tech gadgets and accessories', 'Electronics'),
    (NULL, 'Mixx by vas', 'Mixed retail and services', 'Retail');

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================
