"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { Project, ContextEntry } from "@/types";

interface Props {
  project: Project;
  entries: ContextEntry[];
  variant?: "default" | "outline";
  fullWidth?: boolean;
}

export function ExportButton({ project, entries, variant = "default", fullWidth = false }: Props) {
  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    const latestEntry = entries[0];
    
    let markdown = `# ${project.name} - Context for Claude

## Current State
- Version: ${project.current_version}
- Last updated: ${latestEntry ? new Date(latestEntry.created_at).toLocaleDateString() + " by " + latestEntry.updated_by_name : "No updates yet"}

## Build History
`;

    entries.forEach((entry) => {
      markdown += `
### v${entry.version} - ${new Date(entry.created_at).toLocaleDateString()}
- **What was built:** ${entry.what_was_built}`;
      
      if (entry.decisions_made) {
        markdown += `
- **Decisions:** ${entry.decisions_made}`;
      }
      if (entry.known_issues) {
        markdown += `
- **Issues:** ${entry.known_issues}`;
      }
      if (entry.next_steps) {
        markdown += `
- **Next:** ${entry.next_steps}`;
      }
      markdown += "\n";
    });

    // Add AI handoff notes from the latest entry
    if (latestEntry?.ai_handoff_notes) {
      markdown += `
## AI Handoff Notes
${latestEntry.ai_handoff_notes}
`;
    }

    markdown += `
---
*Exported from Clarify Risk on ${new Date().toLocaleDateString()}*
`;

    return markdown;
  };

  const handleCopy = async () => {
    const markdown = generateMarkdown();
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      onClick={handleCopy}
      className={fullWidth ? "w-full" : ""}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Share with Claude
        </>
      )}
    </Button>
  );
}
