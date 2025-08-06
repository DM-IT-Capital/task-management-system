-- Add email field to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Update existing admin user with email
UPDATE public.users 
SET email = 'admin@example.com' 
WHERE username = 'admin' AND email IS NULL;

-- Update tasks table to better handle assignments
ALTER TABLE public.tasks 
ALTER COLUMN assigned_to DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
