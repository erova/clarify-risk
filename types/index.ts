// ============================================================================
// ORGANIZATIONS
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export type OrgRole = 'admin' | 'member';

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  invited_by: string | null;
  created_at: string;
}

export interface OrgMemberWithUser extends OrgMember {
  user: {
    id: string;
    email: string;
  };
}

export interface OrganizationWithMembers extends Organization {
  org_members: OrgMember[];
}

// ============================================================================
// FOLDERS
// ============================================================================

export type FolderVisibility = 'org' | 'restricted';

export interface Folder {
  id: string;
  org_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  visibility: FolderVisibility;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderAccess {
  id: string;
  folder_id: string;
  user_id: string;
  granted_by: string | null;
  created_at: string;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
}

export interface FolderWithAccess extends Folder {
  folder_access: FolderAccess[];
}

// ============================================================================
// PROJECTS & PROTOTYPES
// ============================================================================

export interface Project {
  id: string;
  folder_id: string | null;
  parent_project_id: string | null;  // If set, this is a "Prototype" under a parent "Project"
  name: string;
  slug: string;
  description: string | null;
  external_url: string | null;
  current_version: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Helper type: A Project with no parent is a "Project", with a parent is a "Prototype"
export type ProjectType = 'project' | 'prototype';

export function getProjectType(project: Project): ProjectType {
  return project.parent_project_id ? 'prototype' : 'project';
}

export interface ContextEntry {
  id: string;
  project_id: string;
  version: string;
  updated_by_name: string;
  what_was_built: string;
  decisions_made: string | null;
  known_issues: string | null;
  next_steps: string | null;
  ai_handoff_notes: string | null;
  created_at: string;
}

export interface ProjectWithEntries extends Project {
  context_entries: ContextEntry[];
}

export interface ProjectWithFolder extends Project {
  folder: Folder | null;
}

export interface ProjectWithPrototypes extends Project {
  prototypes: Project[];  // Child prototypes
}

export interface PrototypeWithParent extends Project {
  parent_project: Project | null;
}

// ============================================================================
// USER CONTEXT
// ============================================================================

export interface UserOrgContext {
  currentOrg: Organization | null;
  orgs: Organization[];
  membership: OrgMember | null;
}
