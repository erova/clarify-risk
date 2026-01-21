-- Clarify Risk Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  current_version TEXT DEFAULT '0.1',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context entries (handoff history)
CREATE TABLE context_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  updated_by_name TEXT NOT NULL,
  what_was_built TEXT NOT NULL,
  decisions_made TEXT,
  known_issues TEXT,
  next_steps TEXT,
  ai_handoff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_context_project ON context_entries(project_id);
CREATE INDEX idx_projects_user ON projects(created_by);
CREATE INDEX idx_projects_slug ON projects(slug);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_entries ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Users can view all projects" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their projects" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

-- Policies for context_entries
CREATE POLICY "Users can view all context entries" ON context_entries
  FOR SELECT USING (true);

CREATE POLICY "Users can create context entries" ON context_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = context_entries.project_id
    )
  );
