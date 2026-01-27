"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Loader2, Copy, Check, Link as LinkIcon } from "lucide-react";

interface InviteMemberFormProps {
  orgId: string;
}

interface InviteResult {
  type: "added" | "invited";
  message: string;
  inviteUrl?: string;
  orgName?: string;
}

export function InviteMemberForm({ orgId }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

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
        setResult(data);
        if (data.type === "added") {
          setEmail("");
          router.refresh();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (result?.inviteUrl) {
      await navigator.clipboard.writeText(result.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendAnother = () => {
    setResult(null);
    setEmail("");
  };

  return (
    <div className="space-y-3">
      {!result?.inviteUrl ? (
        <>
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

          {result?.type === "added" && (
            <p className="text-sm text-green-400 bg-green-500/10 px-3 py-2 rounded-md">
              {result.message}
            </p>
          )}

          <p className="text-xs text-gray-500">
            If they don&apos;t have an account, we&apos;ll create an invite link for them.
          </p>
        </>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-lg">
            <div className="flex items-center gap-2 text-[#60a5fa] mb-2">
              <LinkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Invite link created!</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Share this link with <strong>{email}</strong> to invite them to {result.orgName}:
            </p>
            <div className="flex gap-2">
              <Input
                value={result.inviteUrl}
                readOnly
                className="flex-1 bg-white/5 border-white/10 text-white text-sm"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            The link expires in 7 days. They&apos;ll be added as a member once they sign up.
          </p>

          <Button
            type="button"
            onClick={handleSendAnother}
            variant="outline"
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            Invite another person
          </Button>
        </div>
      )}
    </div>
  );
}
