-- VibeSharing Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS & MEMBERS
-- ============================================================================

-- Organizations (top-level containers: Diligent, Erova Studios, etc.)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members (links users to orgs with roles)
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

-- Indexes for org_members
CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);

-- ============================================================================
-- FOLDERS & ACCESS CONTROL
-- ============================================================================

-- Folders (nested hierarchy within orgs)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'restricted' CHECK (visibility IN ('org', 'restricted')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, parent_id, slug)
);

-- Folder access (for restricted folders - who can see them)
CREATE TABLE folder_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(folder_id, user_id)
);

-- Indexes for folders
CREATE INDEX idx_folders_org ON folders(org_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folder_access_folder ON folder_access(folder_id);
CREATE INDEX idx_folder_access_user ON folder_access(user_id);

-- ============================================================================
-- PROJECTS (updated to live inside folders)
-- ============================================================================

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  external_url TEXT,  -- Optional: link to externally hosted prototype
  current_version TEXT DEFAULT '0.1',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(folder_id, slug)
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

-- Indexes for projects and context
CREATE INDEX idx_projects_folder ON projects(folder_id);
CREATE INDEX idx_projects_user ON projects(created_by);
CREATE INDEX idx_context_project ON context_entries(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_entries ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Organization policies
-- ----------------------------------------------------------------------------

-- Users can only see orgs they're members of
CREATE POLICY "Users see their orgs" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_id = id AND user_id = auth.uid())
  );

-- Anyone can create an org (they become admin)
CREATE POLICY "Users can create orgs" ON organizations
  FOR INSERT WITH CHECK (true);

-- Only admins can update org
CREATE POLICY "Admins can update org" ON organizations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_id = id AND user_id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- Org members policies
-- ----------------------------------------------------------------------------

-- Members can see other members in their orgs
CREATE POLICY "Members see org members" ON org_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members AS om WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid())
  );

-- Admins can add members
CREATE POLICY "Admins can add members" ON org_members
  FOR INSERT WITH CHECK (
    -- Either creating yourself as first admin (new org)
    (user_id = auth.uid() AND role = 'admin')
    OR
    -- Or you're an admin adding someone else
    EXISTS (SELECT 1 FROM org_members WHERE org_id = org_members.org_id AND user_id = auth.uid() AND role = 'admin')
  );

-- Admins can remove members
CREATE POLICY "Admins can remove members" ON org_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM org_members AS om WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- Folder policies
-- ----------------------------------------------------------------------------

-- Helper function to check folder access (handles nested visibility)
CREATE OR REPLACE FUNCTION user_can_access_folder(folder_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  folder_record RECORD;
BEGIN
  SELECT * INTO folder_record FROM folders WHERE id = folder_uuid;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Must be org member first
  IF NOT EXISTS (SELECT 1 FROM org_members WHERE org_id = folder_record.org_id AND user_id = user_uuid) THEN
    RETURN FALSE;
  END IF;
  
  -- Creator always has access
  IF folder_record.created_by = user_uuid THEN
    RETURN TRUE;
  END IF;
  
  -- Org-wide visibility = all org members can access
  IF folder_record.visibility = 'org' THEN
    RETURN TRUE;
  END IF;
  
  -- Restricted = check folder_access table
  IF EXISTS (SELECT 1 FROM folder_access WHERE folder_id = folder_uuid AND user_id = user_uuid) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can see folders they have access to
CREATE POLICY "Users see accessible folders" ON folders
  FOR SELECT USING (user_can_access_folder(id, auth.uid()));

-- Org members can create folders
CREATE POLICY "Org members can create folders" ON folders
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM org_members WHERE org_id = folders.org_id AND user_id = auth.uid())
    AND created_by = auth.uid()
  );

-- Folder creators and org admins can update folders
CREATE POLICY "Creators and admins can update folders" ON folders
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM org_members WHERE org_id = folders.org_id AND user_id = auth.uid() AND role = 'admin')
  );

-- Folder creators and org admins can delete folders
CREATE POLICY "Creators and admins can delete folders" ON folders
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM org_members WHERE org_id = folders.org_id AND user_id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- Folder access policies
-- ----------------------------------------------------------------------------

-- Users can see access grants for folders they can access
CREATE POLICY "Users see folder access" ON folder_access
  FOR SELECT USING (user_can_access_folder(folder_id, auth.uid()));

-- Folder creators and org admins can grant access
CREATE POLICY "Creators can grant access" ON folder_access
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM folders f
      WHERE f.id = folder_id
      AND (
        f.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM org_members WHERE org_id = f.org_id AND user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Folder creators and org admins can revoke access
CREATE POLICY "Creators can revoke access" ON folder_access
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM folders f
      WHERE f.id = folder_id
      AND (
        f.created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM org_members WHERE org_id = f.org_id AND user_id = auth.uid() AND role = 'admin')
      )
    )
  );

-- ----------------------------------------------------------------------------
-- Project policies (updated for folder-based access)
-- ----------------------------------------------------------------------------

-- Users can see projects in folders they have access to
CREATE POLICY "Users see accessible projects" ON projects
  FOR SELECT USING (
    folder_id IS NULL  -- Legacy projects without folder (temporary)
    OR user_can_access_folder(folder_id, auth.uid())
  );

-- Users can create projects in folders they have access to
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (folder_id IS NULL OR user_can_access_folder(folder_id, auth.uid()))
  );

-- Project creators can update their projects
CREATE POLICY "Creators can update projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

-- Project creators can delete their projects
CREATE POLICY "Creators can delete projects" ON projects
  FOR DELETE USING (created_by = auth.uid());

-- ----------------------------------------------------------------------------
-- Context entries policies
-- ----------------------------------------------------------------------------

-- Users can see context for projects they can access
CREATE POLICY "Users see accessible context" ON context_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND (p.folder_id IS NULL OR user_can_access_folder(p.folder_id, auth.uid()))
    )
  );

-- Users can add context to projects they can access
CREATE POLICY "Users can add context" ON context_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
      AND (p.folder_id IS NULL OR user_can_access_folder(p.folder_id, auth.uid()))
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to look up user ID by email (for member invitations)
-- This allows admins to invite users by email address
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id
  FROM auth.users au
  WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_user_id_by_email TO authenticated;

-- ============================================================================
-- MIGRATION HELPERS (run these for existing databases)
-- ============================================================================

-- Migration: Add folder_id to existing projects table
-- ALTER TABLE projects ADD COLUMN folder_id UUID REFERENCES folders(id) ON DELETE CASCADE;
-- ALTER TABLE projects DROP CONSTRAINT projects_slug_key;  -- Remove old unique constraint
-- ALTER TABLE projects ADD CONSTRAINT projects_folder_slug_unique UNIQUE(folder_id, slug);
