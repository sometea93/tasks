-- Remove the default value for priority to allow NULL (no priority set)
ALTER TABLE tasks ALTER COLUMN priority DROP DEFAULT;

-- Update the CHECK constraint to explicitly allow NULL
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_priority_check
  CHECK (priority IS NULL OR (priority >= 1 AND priority <= 3));
