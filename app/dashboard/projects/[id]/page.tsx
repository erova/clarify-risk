import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Plus, Layers, GitFork } from "lucide-react";
import type { Project, ContextEntry } from "@/types";
import { ContextTimeline } from "@/components/ContextTimeline";
import { ExportButton } from "@/components/ExportButton";
import { GitHubDeployButton } from "@/components/GitHubDeployButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: entries } = await supabase
    .from("context_entries")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Get child prototypes (if this is a Project)
  const { data: prototypes } = await supabase
    .from("projects")
    .select("*")
    .eq("parent_project_id", id)
    .order("updated_at", { ascending: false });

  // Get parent project (if this is a Prototype)
  let parentProject: Project | null = null;
  if (project.parent_project_id) {
    const { data: parent } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project.parent_project_id)
      .single();
    parentProject = parent as Project | null;
  }

  const typedProject = project as Project;
  const typedEntries = (entries || []) as ContextEntry[];
  const typedPrototypes = (prototypes || []) as Project[];
  const isPrototype = !!typedProject.parent_project_id;
  const isProject = !isPrototype;
  const hasPrototypes = typedPrototypes.length > 0;

  // Determine prototype URL - use external if set, otherwise local
  const prototypeUrl = typedProject.external_url || `/prototypes/${typedProject.slug}`;
  const isExternal = !!typedProject.external_url;
  const hasLiveUrl = isExternal || isPrototype; // Projects don't have URLs, Prototypes do

  // Build back link
  const backUrl = isPrototype && parentProject 
    ? `/dashboard/projects/${parentProject.id}`
    : typedProject.folder_id 
      ? `/dashboard/folders/${typedProject.folder_id}`
      : "/dashboard";
  const backLabel = isPrototype && parentProject 
    ? `Back to ${parentProject.name}`
    : "Back to projects";

  return (
    <div>
      <Link href={backUrl} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {backLabel}
      </Link>

      {/* Project/Prototype header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{typedProject.name}</h1>
            <Badge variant="secondary" className={isPrototype ? "bg-purple-500/20 text-purple-300" : "bg-white/10 text-gray-300"}>
              {isPrototype ? "Prototype" : "Project"}
            </Badge>
            {isExternal && (
              <Badge variant="outline" className="border-[#3b82f6]/50 text-[#60a5fa]">
                External
              </Badge>
            )}
          </div>
          <p className="text-gray-400">{typedProject.description || "No description"}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>Created {new Date(typedProject.created_at).toLocaleDateString()}</span>
            <span>Last updated {new Date(typedProject.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasLiveUrl && (
            <a href={prototypeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Live
              </Button>
            </a>
          )}
          {isProject && (
            <Link href={`/dashboard/projects/new?parent=${id}`}>
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Prototype
              </Button>
            </Link>
          )}
          <ExportButton project={typedProject} entries={typedEntries} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prototypes section (for Projects) */}
          {isProject && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Prototypes
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {hasPrototypes ? `${typedPrototypes.length} version${typedPrototypes.length !== 1 ? "s" : ""} of this project` : "No prototypes yet"}
                  </CardDescription>
                </div>
                <Link href={`/dashboard/projects/new?parent=${id}`}>
                  <Button size="sm" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!hasPrototypes ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Add your first prototype to this project</p>
                    <Link href={`/dashboard/projects/new?parent=${id}`}>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Prototype
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {typedPrototypes.map((proto) => (
                      <Link key={proto.id} href={`/dashboard/projects/${proto.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                              <GitFork className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{proto.name}</p>
                              <p className="text-xs text-gray-500">
                                {proto.external_url ? "External" : "Local"} · Updated {new Date(proto.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {proto.external_url && (
                            <Badge variant="outline" className="border-[#3b82f6]/50 text-[#60a5fa]">
                              Live
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Context Timeline */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Context History</CardTitle>
              <Link href={`/dashboard/projects/${id}/update`}>
                <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Update
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {typedEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No context entries yet</p>
                  <Link href={`/dashboard/projects/${id}/update`}>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Add First Update
                    </Button>
                  </Link>
                </div>
              ) : (
                <ContextTimeline entries={typedEntries} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-white">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPrototype && parentProject && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Parent Project</p>
                    <Link href={`/dashboard/projects/${parentProject.id}`} className="text-[#60a5fa] hover:underline text-sm">
                      {parentProject.name}
                    </Link>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}
              {hasLiveUrl && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {isExternal ? "External URL" : "Prototype URL"}
                    </p>
                    <code className="text-sm bg-black/30 text-gray-300 px-2 py-1 rounded block truncate">
                      {isExternal ? typedProject.external_url : `/prototypes/${typedProject.slug}`}
                    </code>
                  </div>
                  <Separator className="bg-white/10" />
                </>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Version</p>
                <p className="text-sm font-medium text-white">{typedProject.current_version}</p>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Updates</p>
                <p className="text-sm font-medium text-white">{typedEntries.length} entries</p>
              </div>
            </CardContent>
          </Card>

          {/* Deploy section - only for prototypes without a URL */}
          {isPrototype && !isExternal && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-base text-white">Deploy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-4">
                  Deploy this prototype to make it live and shareable.
                </p>
                <GitHubDeployButton
                  prototypeId={typedProject.id}
                  prototypeName={typedProject.name}
                />
              </CardContent>
            </Card>
          )}

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base text-white">For Claude</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Export the full context history formatted for Claude to understand where you left off.
              </p>
              <ExportButton project={typedProject} entries={typedEntries} variant="outline" fullWidth />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
