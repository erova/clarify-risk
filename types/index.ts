export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  current_version: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
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
