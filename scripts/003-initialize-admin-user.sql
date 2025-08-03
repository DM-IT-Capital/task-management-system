-- Ensure the admin user exists in the database
INSERT INTO users (id, username, password_hash, full_name, troop_rank, role, permissions)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin123',
  'System Administrator',
  'Colonel',
  'admin',
  '{"can_create_tasks": true, "can_delete_tasks": true, "can_manage_users": true}'::jsonb
) ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = 'admin123',
  full_name = 'System Administrator',
  troop_rank = 'Colonel',
  role = 'admin',
  permissions = '{"can_create_tasks": true, "can_delete_tasks": true, "can_manage_users": true}'::jsonb;
