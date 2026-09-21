-- Add Retail VIP tracking columns to loyalty_customers
ALTER TABLE loyalty_customers
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS anniversary DATE;

-- Create an index to quickly find upcoming birthdays if we add cron jobs later
CREATE INDEX IF NOT EXISTS idx_loyalty_dob ON loyalty_customers (dob);
