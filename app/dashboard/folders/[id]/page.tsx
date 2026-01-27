import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/org-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, Lock, Globe, Settings, ArrowLeft } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import type { Project, Folder } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FolderPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { currentOrg, membership } = await getOrgContext();

  if (!currentOrg) {
    redirect("/setup");
  }

  // Get the current folder
  const { data: folder, error: folderError } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .single();

  if (folderError || !folder) {
    notFound();
  }

  // Verify folder belongs to current org
  if (folder.org_id !== currentOrg.id) {
    notFound();
  }

  // Get all folders for sidebar
  const { data: allFolders } = await supabase
    .from("folders")
    .select("*")
    .eq("org_id", currentOrg.id)
    .order("name");

  // Get projects in this folder (only parent projects, not prototypes)
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("folder_id", id)
    .is("parent_project_id", null)  // Only show Projects, not Prototypes
    .order("updated_at", { ascending: false });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  // Get prototype counts for each project
  const projectIds = projects?.map((p: Project) => p.id) || [];
  const { data: prototypeCounts } = projectIds.length > 0 
    ? await supabase
        .from("projects")
        .select("parent_project_id")
        .in("parent_project_id", projectIds)
    : { data: [] };
  
  const prototypeCountMap = new Map<string, number>();
  prototypeCounts?.forEach((p: { parent_project_id: string }) => {
    const count = prototypeCountMap.get(p.parent_project_id) || 0;
    prototypeCountMap.set(p.parent_project_id, count + 1);
  });

  // Get subfolders
  const { data: subfolders } = await supabase
    .from("folders")
    .select("*")
    .eq("parent_id", id)
    .order("name");

  const isAdmin = membership?.role === "admin";
  const typedFolder = folder as Folder;

  // Build breadcrumb path
  const breadcrumbs: Folder[] = [];
  let currentParentId = typedFolder.parent_id;
  while (currentParentId) {
    const parent = (allFolders as Folder[])?.find(f => f.id === currentParentId);
    if (parent) {
      breadcrumbs.unshift(parent);
      currentParentId = parent.parent_id;
    } else {
      break;
    }
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <DashboardSidebar
        folders={(allFolders as Folder[]) || []}
        currentFolderId={id}
        org={currentOrg}
        isAdmin={isAdmin}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            All Projects
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              <Link 
                href={`/dashboard/folders/${crumb.id}`}
                className="hover:text-white transition-colors"
              >
                {crumb.name}
              </Link>
            </span>
          ))}
          <span>/</span>
          <span className="text-white">{typedFolder.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{typedFolder.name}</h1>
                {typedFolder.visibility === "restricted" ? (
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                    <Lock className="w-3 h-3 mr-1" />
                    Restricted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    <Globe className="w-3 h-3 mr-1" />
                    Organization
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 mt-1">
                {(projects?.length || 0)} project{projects?.length !== 1 ? "s" : ""}
                {subfolders && subfolders.length > 0 && ` · ${subfolders.length} subfolder${subfolders.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href={`/dashboard/folders/${id}/settings`}>
                <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            )}
            <Link href={`/dashboard/projects/new?folder=${id}`}>
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Subfolders */}
        {subfolders && subfolders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Subfolders</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {(subfolders as Folder[]).map((subfolder) => (
                <Link key={subfolder.id} href={`/dashboard/folders/${subfolder.id}`}>
                  <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FolderOpen className="w-5 h-5 text-[#3b82f6]" />
                      <span className="text-white font-medium truncate">{subfolder.name}</span>
                      {subfolder.visibility === "restricted" && (
                        <Lock className="w-3 h-3 text-gray-500 ml-auto" />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {!projects || projects.length === 0 ? (
          <Card className="text-center py-12 bg-white/5 border-white/10">
            <CardContent>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No projects in this folder</h3>
              <p className="text-gray-400 mb-4">
                Create a project to start tracking prototypes here
              </p>
              <Link href={`/dashboard/projects/new?folder=${id}`}>
                <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(projects as Project[]).map((project) => {
              const protoCount = prototypeCountMap.get(project.id) || 0;
              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                  <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                        {protoCount > 0 && (
                          <Badge variant="secondary" className="bg-[#3b82f6]/20 text-[#60a5fa]">
                            {protoCount} prototype{protoCount !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-gray-400">
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>/{project.slug}</span>
                        <span>
                          {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
