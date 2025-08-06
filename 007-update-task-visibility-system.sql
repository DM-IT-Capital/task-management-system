-- Add notification tracking table
CREATE TABLE IF NOT EXISTS public.task_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'assignment', '3_days_before', '1_day_before', 'due_date'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add task status updates table for tracking progress
CREATE TABLE IF NOT EXISTS public.task_status_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update tasks table to ensure due_date is required for assigned tasks
ALTER TABLE public.tasks 
ALTER COLUMN due_date SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_notifications_task_id ON public.task_notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_user_id ON public.task_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_notifications_type ON public.task_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_task_status_updates_task_id ON public.task_status_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Enable RLS for new tables
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status_updates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on task_notifications" ON public.task_notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations on task_status_updates" ON public.task_status_updates FOR ALL USING (true);
