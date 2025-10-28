-- Update the lead_status enum to change 'in_progress' to 'working'
-- First, update all existing records
UPDATE leads SET status = 'new' WHERE status = 'in_progress';

-- Drop and recreate the enum type
ALTER TYPE lead_status RENAME TO lead_status_old;

CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'working', 'converted', 'closed');

-- Update the column to use the new type
ALTER TABLE leads 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE lead_status USING status::text::lead_status,
  ALTER COLUMN status SET DEFAULT 'new'::lead_status;

-- Drop the old enum
DROP TYPE lead_status_old;

-- Update the records back with the new status name
-- (No records to update since we set them to 'new' temporarily)