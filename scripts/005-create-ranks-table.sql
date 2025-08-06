-- Create ranks table
CREATE TABLE IF NOT EXISTS public.ranks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default ranks
INSERT INTO public.ranks (name, order_index) VALUES
  ('Private', 1),
  ('Corporal', 2),
  ('Sergeant', 3),
  ('Staff Sergeant', 4),
  ('Sergeant Major', 5),
  ('Second Lieutenant', 6),
  ('First Lieutenant', 7),
  ('Captain', 8),
  ('Major', 9),
  ('Lieutenant Colonel', 10),
  ('Colonel', 11)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on ranks" ON public.ranks FOR ALL USING (true);
