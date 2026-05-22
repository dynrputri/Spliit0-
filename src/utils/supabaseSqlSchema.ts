export const SUPABASE_SQL_SCHEMA = `-- -------------------------------------------------------------
-- Spliit0 Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- -------------------------------------------------------------

-- Enable UUID extension (optional but helpful)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Members table (associated with a group)
CREATE TABLE IF NOT EXISTS public.members (
  id text NOT NULL,
  group_id text REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  color text,
  duit_now_id text,
  bank_name text,
  qr_code_data_url text,
  PRIMARY KEY (group_id, id)
);

-- 3. Create Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id text PRIMARY KEY,
  group_id text REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  paid_by text NOT NULL,
  split_type text NOT NULL,
  splits jsonb NOT NULL, -- Stores structural lists of individual member split allocations
  receipt_url text,
  itemized_items jsonb, -- Stores complex itemized arrays for food/bills receipt parsing
  service_charge_active boolean DEFAULT false,
  sst_active boolean DEFAULT false,
  custom_service_charge_rate numeric(5, 2),
  custom_sst_rate numeric(5, 2),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) or add default permissions
-- For demo projects on Supabase, bypassing RLS or enabling public read/write is fine.
-- Uncomment below if you want to enable Row Level Security and allow public write access:
/*
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write access for all users" ON public.groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write access for all users" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write access for all users" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
*/
`;
