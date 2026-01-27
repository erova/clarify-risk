"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtoHubLogo } from "@/components/ProtoHubLogo";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";

interface InviteInfo {
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const inviteToken = searchParams.get("invite");

  // Fetch invite info if token is present
  useEffect(() => {
    if (inviteToken) {
      setLoadingInvite(true);
      fetch(`/api/invite/${inviteToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setInviteInfo(data);
            setEmail(data.email);
          }
        })
        .catch(() => {
          setError("Failed to load invite information");
        })
        .finally(() => {
          setLoadingInvite(false);
        });
    }
  }, [inviteToken]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If there's an invite, ensure email matches
    if (inviteInfo && email.toLowerCase() !== inviteInfo.email.toLowerCase()) {
      setError(`Please sign up with ${inviteInfo.email} to accept this invite`);
      setLoading(false);
      return;
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    // If there's an invite token, accept it
    if (inviteToken) {
      try {
        const acceptRes = await fetch(`/api/invite/${inviteToken}`, {
          method: "POST",
        });
        const acceptData = await acceptRes.json();
        
        if (acceptData.error) {
          console.error("Failed to accept invite:", acceptData.error);
          // Don't block signup, just log the error
        }
      } catch (err) {
        console.error("Error accepting invite:", err);
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-6 left-6">
        <ProtoHubLogo />
      </div>
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
          <CardDescription className="text-gray-400">
            {inviteInfo 
              ? "Complete your account to join the team"
              : "Join your team to share and collaborate on prototypes"
            }
          </CardDescription>
          
          {inviteInfo && (
            <div className="mt-4 p-3 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-lg">
              <div className="flex items-center gap-2 text-[#60a5fa] mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">You&apos;re invited to join</span>
              </div>
              <p className="text-white font-semibold">{inviteInfo.organization.name}</p>
              <Badge variant="secondary" className="mt-2 bg-white/10 text-gray-300">
                {inviteInfo.role === "admin" ? "Admin" : "Member"}
              </Badge>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!inviteInfo}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-[#3b82f6] disabled:opacity-70"
              />
              {inviteInfo && (
                <p className="text-xs text-gray-500">
                  Email is locked to match your invitation
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#3b82f6] focus:ring-[#3b82f6]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0" 
              disabled={loading}
            >
              {loading 
                ? "Creating account..." 
                : inviteInfo 
                  ? `Join ${inviteInfo.organization.name}`
                  : "Create account"
              }
            </Button>
            <p className="text-sm text-gray-400 text-center">
              Already have an account?{" "}
              <Link href={inviteToken ? `/login?invite=${inviteToken}` : "/login"} className="text-[#60a5fa] hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
