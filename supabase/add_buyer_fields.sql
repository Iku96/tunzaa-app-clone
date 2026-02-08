-- Add columns for Buyer Onboarding

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS interests text[], -- Array of strings for tags
ADD COLUMN IF NOT EXISTS delivery_location text;

-- Create Follows table for Social Graph
CREATE TABLE IF NOT EXISTS follows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, following_id) -- Prevent duplicate follows
);

-- RLS for Follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Drop key policies if they exist to allow re-running this script safely
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own follows" ON follows;
DROP POLICY IF EXISTS "Users can create follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

-- -----------------------------------------------------------------------------
-- Re-create policies
-- -----------------------------------------------------------------------------

-- Allow users to see who they follow and who follows them
CREATE POLICY "Users can view their own follows" 
ON follows FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Allow users to follow others
CREATE POLICY "Users can create follows" 
ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

-- Allow users to unfollow
CREATE POLICY "Users can delete their own follows" 
ON follows FOR DELETE 
USING (auth.uid() = follower_id);

-- Verify creation
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
