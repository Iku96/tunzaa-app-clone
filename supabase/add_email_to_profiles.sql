-- Add email column to profiles table
ALTER TABLE profiles 
ADD COLUMN email text;

-- Optional: Add a unique constraint if needed, but profiles.id is 1:1 with auth.users which has unique email
-- CREATE UNIQUE INDEX profiles_email_idx ON profiles (email);
