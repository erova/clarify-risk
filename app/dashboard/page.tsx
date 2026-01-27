import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/org-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import type { Project, Folder } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { currentOrg, membership } = await getOrgContext();

  // If no org, redirect to setup
  if (!currentOrg) {
    redirect("/setup");
  }

  // Get folders for this org
  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .eq("org_id", currentOrg.id)
    .order("name");

  // Get all projects (for now, show all accessible projects)
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  const isAdmin = membership?.role === "admin";

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <DashboardSidebar
        folders={(folders as Folder[]) || []}
        currentFolderId={null}
        org={currentOrg}
        isAdmin={isAdmin}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">All Projects</h1>
            <p className="text-gray-400 mt-1">
              All prototypes in {currentOrg.name}
            </p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {!projects || projects.length === 0 ? (
          <Card className="text-center py-12 bg-white/5 border-white/10">
            <CardContent>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-gray-400 mb-4">
                Create your first project to start tracking prototype context
              </p>
              <Link href="/dashboard/projects/new">
                <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(projects as Project[]).map((project) => (
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
                      <div className="flex items-center gap-2">
                        {project.folder_id && <FolderOpen className="w-3 h-3" />}
                        <span>/{project.slug}</span>
                      </div>
                      <span>
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
