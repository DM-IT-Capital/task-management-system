-- Complete database setup for your Supabase project
-- Run this in your Supabase SQL Editor

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  troop_rank TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '{"can_create_tasks": true, "can_delete_tasks": false, "can_manage_users": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the ranks table
CREATE TABLE IF NOT EXISTS public.ranks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO public.users (username, email, password_hash, full_name, troop_rank, role, permissions)
VALUES (
  'admin',
  'admin@example.com',
  'admin123',
  'System Administrator',
  'Colonel',
  'admin',
  '{"can_create_tasks": true, "can_delete_tasks": true, "can_manage_users": true}'::jsonb
) ON CONFLICT (username) DO NOTHING;

-- Insert default ranks
INSERT INTO public.ranks (name, order_index) VALUES
  ('Private', 1),
  ('Corporal', 2),
  ('Sergeant', 3),
  ('Staff Sergeant', 4),
  ('Sergeant Major', 5),
  ('Second Lieutenant', 6),
  ('First Lieutenant', 7),
  ('Captain', 8),
  ('Major', 9),
  ('Lieutenant Colonel', 10),
  ('Colonel', 11)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now
-- (You can make these more restrictive later)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on ranks" ON public.ranks FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_ranks_order ON public.ranks(order_index);
