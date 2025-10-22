-- Add postal_code column to leads table
ALTER TABLE public.leads 
ADD COLUMN postal_code TEXT;