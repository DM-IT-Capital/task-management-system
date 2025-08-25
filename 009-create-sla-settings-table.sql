-- Create SLA settings table
CREATE TABLE IF NOT EXISTS sla_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    priority VARCHAR(10) NOT NULL UNIQUE CHECK (priority IN ('high', 'medium', 'low')),
    response_hours INTEGER NOT NULL DEFAULT 24,
    reminder_intervals TEXT NOT NULL DEFAULT '1,6,24',
    escalation_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task assignees table for multiple assignees per task
CREATE TABLE IF NOT EXISTS task_assignees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- Create task status updates table for tracking status changes
CREATE TABLE IF NOT EXISTS task_status_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default SLA settings
INSERT INTO sla_settings (priority, response_hours, reminder_intervals, escalation_enabled) 
VALUES 
    ('high', 4, '1,2,4', true),
    ('medium', 24, '4,12,24', true),
    ('low', 72, '24,48,72', false)
ON CONFLICT (priority) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id ON task_assignees(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id ON task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_status_updates_task_id ON task_status_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_updates_created_at ON task_status_updates(created_at);
