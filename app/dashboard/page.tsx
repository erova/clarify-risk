import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/org-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Folder, FolderOpen, Lock } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import type { Project, Folder as FolderType } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { currentOrg, membership } = await getOrgContext();

  // If no org, redirect to setup
  if (!currentOrg) {
    redirect("/setup");
  }

  // Get ALL folders for sidebar
  const { data: allFolders } = await supabase
    .from("folders")
    .select("*")
    .eq("org_id", currentOrg.id)
    .order("name");

  // Get only ROOT folders (no parent) for main display
  const { data: rootFolders } = await supabase
    .from("folders")
    .select("*")
    .eq("org_id", currentOrg.id)
    .is("parent_id", null)
    .order("name");

  // Get only ROOT projects (not in any folder)
  const { data: rootProjects, error } = await supabase
    .from("projects")
    .select("*")
    .is("folder_id", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  const isAdmin = membership?.role === "admin";
  const hasContent = (rootFolders && rootFolders.length > 0) || (rootProjects && rootProjects.length > 0);

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <DashboardSidebar
        folders={(allFolders as FolderType[]) || []}
        currentFolderId={null}
        org={currentOrg}
        isAdmin={isAdmin}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{currentOrg.name}</h1>
            <p className="text-gray-400 mt-1">
              Folders and projects at the root level
            </p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {!hasContent ? (
          <Card className="text-center py-12 bg-white/5 border-white/10">
            <CardContent>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No folders or projects yet</h3>
              <p className="text-gray-400 mb-4">
                Create a folder to organize your prototypes, or add a project directly
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/projects/new">
                  <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
                    Create Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Root Folders */}
            {rootFolders && rootFolders.length > 0 && (
              <div>
                <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">Folders</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(rootFolders as FolderType[]).map((folder) => (
                    <Link key={folder.id} href={`/dashboard/folders/${folder.id}`}>
                      <Card className="bg-white/5 border-white/10 hover:border-[#3b82f6]/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
                              <FolderOpen className="w-5 h-5 text-[#3b82f6]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate">{folder.name}</h3>
                              <p className="text-xs text-gray-500">
                                {folder.visibility === "restricted" ? (
                                  <span className="flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Restricted
                                  </span>
                                ) : (
                                  "Shared"
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Root Projects (unfiled) */}
            {rootProjects && rootProjects.length > 0 && (
              <div>
                <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
                  {rootFolders && rootFolders.length > 0 ? "Unfiled Projects" : "Projects"}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {(rootProjects as Project[]).map((project) => (
                    <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                            <Badge variant="secondary" className="bg-white/10 text-gray-300">
                              v{project.current_version}
                            </Badge>
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
