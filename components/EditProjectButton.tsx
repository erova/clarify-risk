"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, X } from "lucide-react";
import { EditProjectForm } from "./EditProjectForm";
import type { Project } from "@/types";

interface EditProjectButtonProps {
  project: Project;
  isPrototype: boolean;
}

export function EditProjectButton({ project, isPrototype }: EditProjectButtonProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSaved = () => {
    setIsEditing(false);
    // Hard refresh to get updated data
    window.location.reload();
  };

  if (isEditing) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base text-white">
            Edit {isPrototype ? "Prototype" : "Project"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <EditProjectForm
            project={project}
            isPrototype={isPrototype}
            onSaved={handleSaved}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={() => setIsEditing(true)}
      variant="outline"
      className="border-white/20 text-white hover:bg-white/10 w-full"
    >
      <Pencil className="w-4 h-4 mr-2" />
      Edit {isPrototype ? "Prototype" : "Project"}
    </Button>
  );
}
