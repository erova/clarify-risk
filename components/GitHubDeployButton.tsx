"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2, ExternalLink, Check } from "lucide-react";

interface GitHubDeployButtonProps {
  prototypeId: string;
  prototypeName: string;
  onDeployed?: (url: string) => void;
}

export function GitHubDeployButton({ prototypeId, prototypeName, onDeployed }: GitHubDeployButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleDeploy = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/deploy/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          projectName: prototypeName,
          prototypeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Deployment failed");
        setLoading(false);
        return;
      }

      setDeployedUrl(data.deployedUrl);
      onDeployed?.(data.deployedUrl);
      
      // Small delay before refresh to ensure DB update is complete
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (deployedUrl) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 text-green-400 mb-3">
          <Check className="w-5 h-5" />
          <span className="font-medium">Deployed successfully!</span>
        </div>
        <a 
          href={deployedUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-md transition-colors text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          View Live Prototype
        </a>
        <p className="text-xs text-gray-500 mt-3">
          {deployedUrl}
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Github className="w-4 h-4 mr-2" />
        Deploy from GitHub
      </Button>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-white">
        <Github className="w-5 h-5" />
        <span className="font-medium">Deploy from GitHub</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repo-url" className="text-gray-300">
          Repository URL
        </Label>
        <Input
          id="repo-url"
          placeholder="https://github.com/username/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          disabled={loading}
        />
        <p className="text-xs text-gray-500">
          Paste the URL of a public GitHub repository
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(false)}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeploy}
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching & Deploying...
            </>
          ) : (
            "Deploy"
          )}
        </Button>
      </div>
    </div>
  );
}
