import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/org-context";
import { NewProjectForm } from "@/components/NewProjectForm";
import type { Folder, Project } from "@/types";

interface Props {
  searchParams: Promise<{ folder?: string; parent?: string }>;
}

export default async function NewProjectPage({ searchParams }: Props) {
  const { folder: defaultFolderId, parent: parentProjectId } = await searchParams;
  const supabase = await createClient();
  const { currentOrg } = await getOrgContext();

  if (!currentOrg) {
    redirect("/setup");
  }

  // Get folders for this org
  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .eq("org_id", currentOrg.id)
    .order("name");

  // Get parent project if creating a prototype
  let parentProject: Project | null = null;
  if (parentProjectId) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", parentProjectId)
      .single();
    parentProject = data as Project | null;
  }

  return (
    <NewProjectForm 
      folders={(folders as Folder[]) || []} 
      defaultFolderId={defaultFolderId || null}
      parentProject={parentProject}
    />
  );
}
