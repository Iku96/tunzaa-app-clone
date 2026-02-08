-- Add onboarding_step column to profiles table
ALTER TABLE profiles 
ADD COLUMN onboarding_step text DEFAULT 'started';

-- Update existing users to 'completed' (optional, assumes existing users are done)
-- UPDATE profiles SET onboarding_step = 'completed' WHERE onboarding_step = 'started';
