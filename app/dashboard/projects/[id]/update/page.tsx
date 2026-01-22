"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function UpdateContextPage({ params }: Props) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [updatedByName, setUpdatedByName] = useState("");
  const [whatWasBuilt, setWhatWasBuilt] = useState("");
  const [decisionsMade, setDecisionsMade] = useState("");
  const [knownIssues, setKnownIssues] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [aiHandoffNotes, setAiHandoffNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchProject() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setProject(data as Project);
    }
    fetchProject();
  }, [id, supabase]);

  const incrementVersion = (version: string) => {
    const parts = version.split(".");
    const minor = parseInt(parts[1] || "0") + 1;
    return `${parts[0]}.${minor}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    setLoading(true);
    setError(null);

    const newVersion = incrementVersion(project.current_version);

    // Insert context entry
    const { error: entryError } = await supabase
      .from("context_entries")
      .insert({
        project_id: id,
        version: newVersion,
        updated_by_name: updatedByName,
        what_was_built: whatWasBuilt,
        decisions_made: decisionsMade || null,
        known_issues: knownIssues || null,
        next_steps: nextSteps || null,
        ai_handoff_notes: aiHandoffNotes || null,
      });

    if (entryError) {
      setError(entryError.message);
      setLoading(false);
      return;
    }

    // Update project version
    const { error: projectError } = await supabase
      .from("projects")
      .update({ 
        current_version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/projects/${id}`);
    router.refresh();
  };

  if (!project) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/projects/${id}`} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {project.name}
      </Link>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Add Context Update</CardTitle>
          <CardDescription className="text-gray-400">
            Document what you built so the next person (or Claude) can pick up where you left off.
            This will increment the version to v{incrementVersion(project.current_version)}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Your Name</Label>
              <Input
                id="name"
                placeholder="Who worked on this?"
                value={updatedByName}
                onChange={(e) => setUpdatedByName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="what" className="text-gray-300">What was built? *</Label>
              <Textarea
                id="what"
                placeholder="Describe what you added, changed, or completed"
                value={whatWasBuilt}
                onChange={(e) => setWhatWasBuilt(e.target.value)}
                required
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decisions" className="text-gray-300">Decisions made</Label>
              <Textarea
                id="decisions"
                placeholder="Any design decisions, tradeoffs, or reasoning worth noting"
                value={decisionsMade}
                onChange={(e) => setDecisionsMade(e.target.value)}
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues" className="text-gray-300">Known issues</Label>
              <Textarea
                id="issues"
                placeholder="Bugs, incomplete features, or things that need attention"
                value={knownIssues}
                onChange={(e) => setKnownIssues(e.target.value)}
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next" className="text-gray-300">Next steps</Label>
              <Textarea
                id="next"
                placeholder="What should the next person work on?"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai" className="text-gray-300">AI Handoff Notes</Label>
              <Textarea
                id="ai"
                placeholder="Technical notes for Claude: patterns used, gotchas, file structure, etc."
                value={aiHandoffNotes}
                onChange={(e) => setAiHandoffNotes(e.target.value)}
                rows={3}
                className="font-mono text-sm bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500">
                These notes help Claude understand the codebase when continuing your work
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href={`/dashboard/projects/${id}`}>
                <Button variant="outline" type="button" className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading || !updatedByName || !whatWasBuilt}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              >
                {loading ? "Saving..." : "Save Update"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
