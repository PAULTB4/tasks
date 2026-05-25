-- TaskForge Database Schema
-- InsForge-adapted: uses gen_random_uuid(), TEXT user_id, no FK to auth.users

-- Categories (areas, courses, sub-areas, etc.)
-- Self-referencing through parent_id for infinite nesting
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'list' CHECK (type IN ('folder', 'list')),
  deleted_at TIMESTAMPTZ,
  deleted_root_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  deleted_as TEXT CHECK (deleted_as IN ('tree', 'folder', 'list')),
  deleted_original_parent_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);
CREATE INDEX idx_categories_deleted_root_id ON categories(deleted_root_id);

-- Task statuses (Kanban columns)
-- category_id = NULL means global status (default for all categories)
-- category_id = set means override for that specific category
CREATE TABLE task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, position)
);

CREATE INDEX idx_task_statuses_user_id ON task_statuses(user_id);
CREATE INDEX idx_task_statuses_category_id ON task_statuses(category_id);

-- Tasks
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  status_id UUID NOT NULL REFERENCES task_statuses(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Task notes
CREATE TABLE task_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_notes_task_id ON task_notes(task_id);
CREATE INDEX idx_task_notes_user_id ON task_notes(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_notes_updated_at
  BEFORE UPDATE ON task_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User isolation for PostgREST/InsForge requests
CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    NULLIF(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', ''),
    NULLIF(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'user_id', '')
  )
$$;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_user_isolation ON categories
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());

CREATE POLICY task_statuses_user_isolation ON task_statuses
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());

CREATE POLICY tasks_user_isolation ON tasks
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());

CREATE POLICY task_notes_user_isolation ON task_notes
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());

-- User feedback/suggestions
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feedback' CHECK (type IN ('feedback', 'suggestion', 'bug')),
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  read_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY feedback_user_isolation ON feedback
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());

-- Admin users (manually assigned)
CREATE TABLE admin_users (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_users_isolation ON admin_users
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());

-- User profiles for tracking and metrics
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,
  last_login TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_own ON user_profiles
  FOR ALL
  USING (user_id = current_app_user_id())
  WITH CHECK (user_id = current_app_user_id());
