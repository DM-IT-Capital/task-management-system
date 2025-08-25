-- Fix user creation issues and add 'assigned' status support
-- This script addresses the user creation problems and ensures proper database structure

-- First, let's make sure the users table exists with correct structure
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    troop_rank VARCHAR(50) DEFAULT 'Private',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    can_create_tasks BOOLEAN DEFAULT false,
    can_delete_tasks BOOLEAN DEFAULT false,
    can_manage_users BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update tasks table to include 'assigned' status
DO $$ 
BEGIN
    -- Check if the status column exists and update the constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'status'
    ) THEN
        -- Drop the old constraint if it exists
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
        
        -- Add the new constraint with 'assigned' status
        ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
        CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed'));
    END IF;
END $$;

-- Ensure tasks table has proper structure
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_assignees table for multiple assignees support
CREATE TABLE IF NOT EXISTS task_assignees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- Create task_status_updates table for tracking status changes
CREATE TABLE IF NOT EXISTS task_status_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_status_updates_task_id ON task_status_updates(task_id);

-- Create or update the admin user
INSERT INTO users (
    username, 
    password, 
    email, 
    full_name, 
    troop_rank, 
    role, 
    can_create_tasks, 
    can_delete_tasks, 
    can_manage_users
) VALUES (
    'admin',
    'admin123',
    'admin@taskmanagement.com',
    'System Administrator',
    'Colonel',
    'admin',
    true,
    true,
    true
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    troop_rank = EXCLUDED.troop_rank,
    role = EXCLUDED.role,
    can_create_tasks = EXCLUDED.can_create_tasks,
    can_delete_tasks = EXCLUDED.can_delete_tasks,
    can_manage_users = EXCLUDED.can_manage_users,
    updated_at = NOW();

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO users (username, password, email, full_name, troop_rank, role, can_create_tasks) VALUES
('john_doe', 'password123', 'john@example.com', 'John Doe', 'Sergeant', 'user', true),
('jane_smith', 'password123', 'jane@example.com', 'Jane Smith', 'Corporal', 'user', false)
ON CONFLICT (username) DO NOTHING;

COMMIT;
