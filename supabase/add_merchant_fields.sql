-- Add columns for Merchant Onboarding (Mauzo by Tunzaa)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tin_number text,
ADD COLUMN IF NOT EXISTS business_license_number text,
ADD COLUMN IF NOT EXISTS brela_certificate_number text,
ADD COLUMN IF NOT EXISTS shop_description text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS ward text,
ADD COLUMN IF NOT EXISTS map_location jsonb; 
-- map_location can store { "latitude": -6.7, "longitude": 39.2 }

-- Verify column addition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
