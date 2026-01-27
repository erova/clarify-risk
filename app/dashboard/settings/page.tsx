import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/org-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Building2, Trash2 } from "lucide-react";
import { InviteMemberForm } from "@/components/InviteMemberForm";
import { RemoveMemberButton } from "@/components/RemoveMemberButton";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { currentOrg, membership } = await getOrgContext();

  if (!currentOrg) {
    redirect("/setup");
  }

  if (membership?.role !== "admin") {
    redirect("/dashboard");
  }

  // Get all members for this org with their user info
  const { data: members } = await supabase
    .from("org_members")
    .select(`
      *,
      user:user_id (
        id,
        email
      ),
      inviter:invited_by (
        id,
        email
      )
    `)
    .eq("org_id", currentOrg.id)
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[#3b82f6]" />
          {currentOrg.name} Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your organization and team members</p>
      </div>

      {/* Members Section */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription className="text-gray-400">
                {members?.length || 0} member{members?.length !== 1 ? "s" : ""} in this organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite Form */}
          <InviteMemberForm orgId={currentOrg.id} />

          {/* Members List */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            {members?.map((member: {
              id: string;
              org_id: string;
              user_id: string;
              role: string;
              created_at: string;
              user: { id: string; email: string } | null;
              inviter: { id: string; email: string } | null;
            }) => {
              const memberUser = member.user;
              const inviter = member.inviter;
              const isCurrentUser = member.user_id === user.id;

              return (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#60a5fa] font-medium">
                        {memberUser?.email?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {memberUser?.email || "Unknown user"}
                        {isCurrentUser && <span className="text-gray-500 ml-2">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                        {inviter && ` · Invited by ${inviter.email}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={member.role === "admin" ? "default" : "secondary"}
                      className={member.role === "admin" 
                        ? "bg-[#3b82f6]/20 text-[#60a5fa] border-0" 
                        : "bg-white/10 text-gray-300 border-0"
                      }
                    >
                      {member.role}
                    </Badge>
                    {!isCurrentUser && (
                      <RemoveMemberButton 
                        memberId={member.id} 
                        memberEmail={memberUser?.email || "this member"} 
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Org Info */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Organization ID</p>
            <code className="text-sm bg-black/30 text-gray-300 px-2 py-1 rounded block">
              {currentOrg.id}
            </code>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">URL Slug</p>
            <code className="text-sm bg-black/30 text-gray-300 px-2 py-1 rounded block">
              {currentOrg.slug}
            </code>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
            <p className="text-sm text-gray-300">
              {new Date(currentOrg.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
