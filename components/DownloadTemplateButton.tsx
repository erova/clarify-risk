"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileCode, Loader2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
}

interface DownloadTemplateButtonProps {
  projectName: string;
  projectSlug: string;
}

const TEMPLATES: Template[] = [
  {
    id: "html-tailwind",
    name: "HTML + Tailwind",
    description: "Simple static prototype - just HTML, CSS, JS",
  },
  {
    id: "nextjs-tailwind",
    name: "Next.js + Tailwind",
    description: "Full React app with Next.js",
  },
];

export function DownloadTemplateButton({ projectName, projectSlug }: DownloadTemplateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (templateId: string) => {
    setDownloading(templateId);

    try {
      const params = new URLSearchParams({
        template: templateId,
        name: projectName,
        slug: projectSlug,
      });

      const response = await fetch(`/api/templates?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to generate template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectSlug}-starter.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsOpen(false);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download template");
    } finally {
      setDownloading(null);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Starter Template
      </Button>
    );
  }

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <FileCode className="w-5 h-5" />
          <span className="font-medium">Choose a Template</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleDownload(template.id)}
            disabled={downloading !== null}
            className="w-full p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{template.name}</p>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
              {downloading === template.id ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Download, build in Cursor, then upload ZIP to deploy.
      </p>
    </div>
  );
}
