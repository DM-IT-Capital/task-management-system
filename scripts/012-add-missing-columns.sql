-- Add missing permission columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS can_create_tasks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_delete_tasks BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_users BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing admin user with proper permissions
UPDATE public.users 
SET 
  can_create_tasks = true,
  can_delete_tasks = true,
  can_manage_users = true,
  password_hash = 'admin'
WHERE username = 'admin';

-- Insert admin user if it doesn't exist
INSERT INTO public.users (username, password_hash, full_name, troop_rank, role, can_create_tasks, can_delete_tasks, can_manage_users)
VALUES (
  'admin',
  'admin',
  'System Administrator',
  'Colonel',
  'admin',
  true,
  true,
  true
) ON CONFLICT (username) DO UPDATE SET
  password_hash = 'admin',
  can_create_tasks = true,
  can_delete_tasks = true,
  can_manage_users = true;
