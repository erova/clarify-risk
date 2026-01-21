import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DiligentLogo } from "@/components/DiligentLogo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <DiligentLogo href="/dashboard" />
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/prototypes" className="text-sm text-gray-400 hover:text-white transition-colors">
                Prototypes
              </Link>
              <Link href="/resources" className="text-sm text-gray-400 hover:text-white transition-colors">
                Resources
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <Button 
                variant="ghost" 
                size="sm" 
                type="submit"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
