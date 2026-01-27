"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, ExternalLink } from "lucide-react";

interface ZipUploadButtonProps {
  prototypeId: string;
  prototypeName: string;
}

export function ZipUploadButton({ prototypeId, prototypeName }: ZipUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setError("Please select a ZIP file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prototypeId", prototypeId);
      formData.append("projectName", prototypeName);

      const response = await fetch("/api/deploy/zip", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setDeployedUrl(data.deployedUrl);
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
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
        <p className="text-xs text-gray-500 mt-3">{deployedUrl}</p>
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
        <Upload className="w-4 h-4 mr-2" />
        Upload ZIP to Deploy
      </Button>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4">
      <div className="flex items-center gap-2 text-white">
        <Upload className="w-5 h-5" />
        <span className="font-medium">Upload ZIP to Deploy</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
            <p className="text-gray-400">Uploading & deploying...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-500" />
            <p className="text-gray-400">Click to select a ZIP file</p>
            <p className="text-xs text-gray-500">or drag and drop</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(false)}
          variant="outline"
          className="border-white/20 text-gray-300 hover:bg-white/10"
          disabled={uploading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
