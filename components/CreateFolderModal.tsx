"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Folder, Lock, Globe, Loader2 } from "lucide-react";
import type { FolderVisibility } from "@/types";

interface CreateFolderModalProps {
  orgId: string;
  parentId: string | null;
  parentName?: string;
  onClose: () => void;
}

export function CreateFolderModal({ orgId, parentId, parentName, onClose }: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [visibility, setVisibility] = useState<FolderVisibility>("restricted");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      const { data, error: insertError } = await supabase
        .from("folders")
        .insert({
          org_id: orgId,
          parent_id: parentId,
          name,
          slug,
          visibility,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          setError("A folder with this name already exists in this location");
        } else {
          setError(insertError.message);
        }
        setLoading(false);
        return;
      }

      // If visibility is restricted, add the creator to folder_access
      if (visibility === "restricted") {
        await supabase
          .from("folder_access")
          .insert({
            folder_id: data.id,
            user_id: user.id,
            granted_by: user.id,
          });
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a2e] border border-white/10 rounded-lg w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create Folder</h2>
              {parentName && (
                <p className="text-sm text-gray-500">Inside {parentName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Folder Name</Label>
            <Input
              id="name"
              placeholder="e.g., Client Projects, Q1 Prototypes"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-gray-300">URL Slug</Label>
            <Input
              id="slug"
              placeholder="client-projects"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              required
              pattern="[a-z0-9-]+"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">Visibility</Label>
            
            <div className="space-y-2">
              {/* Restricted option */}
              <button
                type="button"
                onClick={() => setVisibility("restricted")}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                  visibility === "restricted"
                    ? "border-[#3b82f6] bg-[#3b82f6]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Lock className={`w-5 h-5 mt-0.5 ${visibility === "restricted" ? "text-[#3b82f6]" : "text-gray-400"}`} />
                <div>
                  <p className={`font-medium ${visibility === "restricted" ? "text-white" : "text-gray-300"}`}>
                    Restricted
                  </p>
                  <p className="text-sm text-gray-500">
                    Only you and people you invite can see this folder
                  </p>
                </div>
              </button>

              {/* Org-wide option */}
              <button
                type="button"
                onClick={() => setVisibility("org")}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                  visibility === "org"
                    ? "border-[#3b82f6] bg-[#3b82f6]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 ${visibility === "org" ? "text-[#3b82f6]" : "text-gray-400"}`} />
                <div>
                  <p className={`font-medium ${visibility === "org" ? "text-white" : "text-gray-300"}`}>
                    Shared
                  </p>
                  <p className="text-sm text-gray-500">
                    Everyone in your organization can see this folder
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name || !slug}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Folder"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
