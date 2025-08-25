-- Reset admin password back to 'admin'
UPDATE public.users 
SET password_hash = 'admin'
WHERE username = 'admin';

-- Ensure admin has all permissions
UPDATE public.users 
SET 
  can_create_tasks = true,
  can_delete_tasks = true,
  can_manage_users = true,
  role = 'admin'
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
