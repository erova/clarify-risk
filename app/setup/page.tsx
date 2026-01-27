"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { ProtoHubLogo } from "@/components/ProtoHubLogo";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in");
        setLoading(false);
        return;
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name, slug })
        .select()
        .single();

      if (orgError) {
        if (orgError.code === "23505") {
          setError("An organization with this URL already exists");
        } else {
          setError(orgError.message);
        }
        setLoading(false);
        return;
      }

      // Add current user as admin
      const { error: memberError } = await supabase
        .from("org_members")
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: "admin",
          invited_by: user.id,
        });

      if (memberError) {
        setError(memberError.message);
        // Clean up the org
        await supabase.from("organizations").delete().eq("id", org.id);
        setLoading(false);
        return;
      }

      // Set this as the current org via API
      await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id }),
      });

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <ProtoHubLogo href={undefined} />
      </div>

      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[#3b82f6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <CardTitle className="text-2xl text-white">Create Your Organization</CardTitle>
          <CardDescription className="text-gray-400">
            Organizations help you organize prototypes and collaborate with your team
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Organization Name</Label>
              <Input
                id="name"
                placeholder="e.g., Diligent, Erova Studios"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-300">URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">vibesharing.com/</span>
                <Input
                  id="slug"
                  placeholder="diligent"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                This will be used in URLs to identify your organization
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !name || !slug}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      <p className="text-gray-500 text-sm mt-6">
        You can invite team members after creating your organization
      </p>
    </div>
  );
}
