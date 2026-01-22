"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isExternal = externalUrl.trim().length > 0;

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({
        name,
        slug,
        description: description || null,
        external_url: externalUrl.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/projects/${data.id}`);
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to projects
      </Link>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Create New Project</CardTitle>
          <CardDescription className="text-gray-400">
            Set up a new project to track your prototype and context handoffs
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
              <Label htmlFor="name" className="text-gray-300">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., Agentic Hero"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-300">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/prototypes/</span>
                <Input
                  id="slug"
                  placeholder="agentic-hero"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                {isExternal 
                  ? "Used as an identifier (prototype is hosted externally)" 
                  : "This will be the URL for your prototype on this site"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="external" className="text-gray-300 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                External Prototype URL (optional)
              </Label>
              <Input
                id="external"
                type="url"
                placeholder="https://your-prototype.vercel.app"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500">
                Host your prototype on your own GitHub/Vercel. Leave blank to host on this site.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What is this prototype about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/dashboard">
                <Button variant="outline" type="button" className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading || !name || !slug}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
