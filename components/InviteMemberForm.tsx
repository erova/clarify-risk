"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2 } from "lucide-react";

interface InviteMemberFormProps {
  orgId: string;
}

export function InviteMemberForm({ orgId }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to invite member");
      } else {
        setSuccess(`Successfully added ${email} to the organization`);
        setEmail("");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email to invite..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        />
        <Button 
          type="submit" 
          disabled={loading || !email}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </>
          )}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-400 bg-green-500/10 px-3 py-2 rounded-md">
          {success}
        </p>
      )}

      <p className="text-xs text-gray-500">
        The user must have an account on this platform. They&apos;ll see the organization after signing in.
      </p>
    </div>
  );
}
