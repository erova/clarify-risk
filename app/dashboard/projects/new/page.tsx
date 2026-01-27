import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/org-context";
import { NewProjectForm } from "@/components/NewProjectForm";
import type { Folder } from "@/types";

interface Props {
  searchParams: Promise<{ folder?: string }>;
}

export default async function NewProjectPage({ searchParams }: Props) {
  const { folder: defaultFolderId } = await searchParams;
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

  return (
    <NewProjectForm 
      folders={(folders as Folder[]) || []} 
      defaultFolderId={defaultFolderId || null}
    />
  );
}
