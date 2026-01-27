"use client";

import { useState } from "react";
import { FolderTree } from "@/components/FolderTree";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import type { Folder, Organization } from "@/types";

interface DashboardSidebarProps {
  folders: Folder[];
  currentFolderId?: string | null;
  org: Organization;
  isAdmin: boolean;
}

export function DashboardSidebar({ folders, currentFolderId, org, isAdmin }: DashboardSidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);

  const handleCreateFolder = (parentId: string | null) => {
    setParentFolderId(parentId);
    setShowCreateModal(true);
  };

  const parentFolder = parentFolderId 
    ? folders.find(f => f.id === parentFolderId) 
    : null;

  return (
    <>
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-2">
              Folders
            </h3>
            <FolderTree
              folders={folders}
              currentFolderId={currentFolderId}
              orgSlug={org.slug}
              canCreateFolder={isAdmin}
              onCreateFolder={handleCreateFolder}
            />
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          orgId={org.id}
          parentId={parentFolderId}
          parentName={parentFolder?.name}
          onClose={() => {
            setShowCreateModal(false);
            setParentFolderId(null);
          }}
        />
      )}
    </>
  );
}
