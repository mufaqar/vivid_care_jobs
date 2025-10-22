-- Add company_name and postal_code columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN company_name TEXT,
ADD COLUMN postal_code TEXT;

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, company_name, postal_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'postal_code'
  );
  RETURN NEW;
END;
$$;