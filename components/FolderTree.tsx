"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  Lock,
  Globe,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Folder as FolderType, FolderWithChildren } from "@/types";

interface FolderTreeProps {
  folders: FolderType[];
  currentFolderId?: string | null;
  orgSlug: string;
  canCreateFolder?: boolean;
  onCreateFolder?: (parentId: string | null) => void;
}

// Build tree structure from flat array
function buildFolderTree(folders: FolderType[]): FolderWithChildren[] {
  const folderMap = new Map<string, FolderWithChildren>();
  const rootFolders: FolderWithChildren[] = [];

  // First pass: create map entries
  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Second pass: build tree
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!;
    if (folder.parent_id && folderMap.has(folder.parent_id)) {
      folderMap.get(folder.parent_id)!.children.push(node);
    } else {
      rootFolders.push(node);
    }
  });

  // Sort children alphabetically
  const sortChildren = (nodes: FolderWithChildren[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(rootFolders);

  return rootFolders;
}

interface FolderNodeProps {
  folder: FolderWithChildren;
  depth: number;
  currentFolderId?: string | null;
  orgSlug: string;
  onCreateFolder?: (parentId: string | null) => void;
}

function FolderNode({ folder, depth, currentFolderId, orgSlug, onCreateFolder }: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const isActive = currentFolderId === folder.id;
  const hasChildren = folder.children.length > 0;

  return (
    <div>
      <div 
        className={`group flex items-center gap-1 py-1.5 px-2 rounded-md transition-colors ${
          isActive 
            ? "bg-[#3b82f6]/20 text-white" 
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-4 h-4 flex items-center justify-center ${hasChildren ? "opacity-100" : "opacity-0"}`}
          disabled={!hasChildren}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>

        {/* Folder link */}
        <Link 
          href={`/dashboard/folders/${folder.id}`}
          className="flex-1 flex items-center gap-2 min-w-0"
        >
          {isExpanded && hasChildren ? (
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate text-sm">{folder.name}</span>
          
          {/* Visibility indicator */}
          {folder.visibility === "restricted" ? (
            <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
          ) : (
            <Globe className="w-3 h-3 text-gray-500 flex-shrink-0" />
          )}
        </Link>

        {/* Add subfolder button (shows on hover) */}
        {onCreateFolder && (
          <button
            onClick={() => onCreateFolder(folder.id)}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-opacity"
            title="Add subfolder"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              currentFolderId={currentFolderId}
              orgSlug={orgSlug}
              onCreateFolder={onCreateFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({ 
  folders, 
  currentFolderId, 
  orgSlug,
  canCreateFolder = false,
  onCreateFolder
}: FolderTreeProps) {
  const tree = buildFolderTree(folders);

  if (folders.length === 0 && canCreateFolder) {
    return (
      <div className="p-4 text-center">
        <Folder className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 mb-3">No folders yet</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCreateFolder?.(null)}
          className="border-white/20 text-gray-300 hover:bg-white/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Folder
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* All Projects link */}
      <Link
        href="/dashboard"
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors ${
          !currentFolderId 
            ? "bg-[#3b82f6]/20 text-white" 
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Folder className="w-4 h-4" />
        All Projects
      </Link>

      {/* Folder tree */}
      {tree.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          depth={0}
          currentFolderId={currentFolderId}
          orgSlug={orgSlug}
          onCreateFolder={onCreateFolder}
        />
      ))}

      {/* Create folder button */}
      {canCreateFolder && folders.length > 0 && (
        <button
          onClick={() => onCreateFolder?.(null)}
          className="flex items-center gap-2 py-1.5 px-2 rounded-md text-sm text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors w-full"
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      )}
    </div>
  );
}
