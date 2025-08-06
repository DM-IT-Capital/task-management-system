-- Update the existing SQL setup to include the new tables and constraints
-- Run this after running the previous setup scripts

-- Make sure due_date is required for assigned tasks (we'll handle this in the application logic)
-- We can't make it NOT NULL because unassigned tasks might not have due dates

-- Add a trigger to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ranks_updated_at ON public.ranks;
CREATE TRIGGER update_ranks_updated_at 
    BEFORE UPDATE ON public.ranks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
