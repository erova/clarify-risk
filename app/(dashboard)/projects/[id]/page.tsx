import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Plus, Copy } from "lucide-react";
import type { Project, ContextEntry } from "@/types";
import { ContextTimeline } from "@/components/ContextTimeline";
import { ExportButton } from "@/components/ExportButton";

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

  const typedProject = project as Project;
  const typedEntries = (entries || []) as ContextEntry[];

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to projects
      </Link>

      {/* Project header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{typedProject.name}</h1>
            <Badge variant="secondary">v{typedProject.current_version}</Badge>
          </div>
          <p className="text-gray-600">{typedProject.description || "No description"}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>Created {new Date(typedProject.created_at).toLocaleDateString()}</span>
            <span>Last updated {new Date(typedProject.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/prototypes/${typedProject.slug}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Prototype
            </Button>
          </Link>
          <ExportButton project={typedProject} entries={typedEntries} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content - Context Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Context History</CardTitle>
              <Link href={`/projects/${id}/update`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Update
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {typedEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No context entries yet</p>
                  <Link href={`/projects/${id}/update`}>
                    <Button variant="outline">Add First Update</Button>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prototype URL</p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block truncate">
                  /prototypes/{typedProject.slug}
                </code>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Version</p>
                <p className="text-sm font-medium">{typedProject.current_version}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Updates</p>
                <p className="text-sm font-medium">{typedEntries.length} entries</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">For Claude</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
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
