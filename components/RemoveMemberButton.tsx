"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface RemoveMemberButtonProps {
  memberId: string;
  memberEmail: string;
}

export function RemoveMemberButton({ memberId, memberEmail }: RemoveMemberButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/org/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error removing member:", err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Remove?</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleRemove}
          disabled={loading}
          className="h-7 px-2"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="h-7 px-2 text-gray-400 hover:text-white"
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setShowConfirm(true)}
      className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
      title={`Remove ${memberEmail}`}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
