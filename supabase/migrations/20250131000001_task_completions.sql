-- Create task_completions table for tracking recurring task instance completions
CREATE TABLE task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, completed_date)
);

-- Index for fast lookups by task and date
CREATE INDEX idx_task_completions_task_date ON task_completions(task_id, completed_date);

-- Index for fetching user's completions in a date range
CREATE INDEX idx_task_completions_user_date ON task_completions(user_id, completed_date);

-- Enable Row Level Security
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own completions
CREATE POLICY "Users can CRUD own completions" ON task_completions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable Realtime for the task_completions table
ALTER PUBLICATION supabase_realtime ADD TABLE task_completions;
