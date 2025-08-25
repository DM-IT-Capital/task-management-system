-- Add 'on_hold' status to tasks table if it doesn't exist
DO $$
BEGIN
    -- Check if the status column exists and add on_hold if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%tasks_status_check%' 
        AND check_clause LIKE '%on_hold%'
    ) THEN
        -- Drop existing check constraint
        ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
        
        -- Add new check constraint with on_hold status
        ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
        CHECK (status IN ('pending', 'assigned', 'in_progress', 'on_hold', 'completed'));
        
        RAISE NOTICE 'Added on_hold status to tasks table';
    ELSE
        RAISE NOTICE 'on_hold status already exists in tasks table';
    END IF;
END $$;

-- Update any existing tasks that might need the new status
-- This is optional and can be customized based on your needs
UPDATE tasks 
SET status = 'on_hold' 
WHERE status = 'paused' OR status = 'suspended';

-- Create index on status column for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Add comment to document the status values
COMMENT ON COLUMN tasks.status IS 'Task status: pending, assigned, in_progress, on_hold, completed';
