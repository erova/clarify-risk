"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Building2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Organization, OrgRole } from "@/types";

interface OrgSwitcherProps {
  currentOrg: Organization | null;
  orgs: Organization[];
  userRole: OrgRole | null;
}

export function OrgSwitcher({ currentOrg, orgs, userRole }: OrgSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === currentOrg?.id) {
      setIsOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const response = await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error switching org:", error);
    } finally {
      setSwitching(false);
      setIsOpen(false);
    }
  };

  // If no orgs, show setup prompt
  if (!currentOrg || orgs.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="border-dashed border-white/20 text-gray-400 hover:text-white hover:bg-white/10"
        onClick={() => router.push("/setup")}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Organization
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:bg-white/10 gap-2"
        disabled={switching}
      >
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="max-w-[150px] truncate">{currentOrg.name}</span>
        {userRole === "admin" && (
          <span className="text-[10px] bg-[#3b82f6]/20 text-[#60a5fa] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Admin
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1">
                Your Organizations
              </p>
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrg(org.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                    org.id === currentOrg.id
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{org.name}</span>
                  {org.id === currentOrg.id && (
                    <Check className="w-4 h-4 text-[#3b82f6]" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-white/10 p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/setup");
                }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Organization</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
