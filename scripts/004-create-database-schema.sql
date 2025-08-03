-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
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

-- Insert the default admin user
INSERT INTO public.users (username, password_hash, full_name, troop_rank, role, permissions)
VALUES (
  'admin',
  'admin123',
  'System Administrator',
  'Colonel',
  'admin',
  '{"can_create_tasks": true, "can_delete_tasks": true, "can_manage_users": true}'::jsonb
) ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true);
