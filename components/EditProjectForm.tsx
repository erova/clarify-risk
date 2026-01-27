"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ExternalLink } from "lucide-react";
import type { Project } from "@/types";

interface EditProjectFormProps {
  project: Project;
  isPrototype: boolean;
  onSaved: () => void;
  onCancel: () => void;
}

export function EditProjectForm({ project, isPrototype, onSaved, onCancel }: EditProjectFormProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [externalUrl, setExternalUrl] = useState(project.external_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name,
        description: description || null,
        external_url: externalUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          {isPrototype ? "Prototype Name" : "Project Name"}
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="external" className="text-gray-300 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          External URL
        </Label>
        <Input
          id="external"
          type="url"
          placeholder="https://..."
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">Description</Label>
        <Textarea
          id="description"
          placeholder="What is this about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !name}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
