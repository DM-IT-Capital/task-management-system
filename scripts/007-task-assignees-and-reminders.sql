-- 1) Multi-assignee support
CREATE TABLE IF NOT EXISTS public.task_assignees (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);

-- 2) Reminder flags on tasks to avoid duplicate sends
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_3d_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_1d_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_due_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional index for due date queries
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- 3) Keep the original assigned_to nullable for backward compatibility (we now use task_assignees)
ALTER TABLE public.tasks ALTER COLUMN assigned_to DROP NOT NULL;

-- 4) RLS - keep liberal during dev
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- Allow all operations in dev (tighten later)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Allow all operations on task_assignees'
      AND tablename = 'task_assignees'
  ) THEN
    CREATE POLICY "Allow all operations on task_assignees" ON public.task_assignees FOR ALL USING (true);
  END IF;
END
$$;
