"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  isPrototype: boolean;
  redirectTo: string;
}

export function DeleteProjectButton({ 
  projectId, 
  projectName, 
  isPrototype,
  redirectTo 
}: DeleteProjectButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete: " + error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
        <p className="text-sm text-red-400">
          Delete <strong>{projectName}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => setConfirming(false)}
            variant="outline"
            size="sm"
            className="border-white/20 text-gray-300 hover:bg-white/10"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Yes, Delete"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setConfirming(true)}
      variant="outline"
      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete {isPrototype ? "Prototype" : "Project"}
    </Button>
  );
}
