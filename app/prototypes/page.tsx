import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { DiligentLogo } from "@/components/DiligentLogo";
import type { Project } from "@/types";

export default async function PrototypesIndexPage() {
  const supabase = await createClient();
  
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen relative">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DiligentLogo />
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Prototypes</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/resources">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                Get the Kit
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Prototypes</h1>
          <p className="text-gray-400">Browse interactive prototypes built by the team</p>
        </div>

        {!projects || projects.length === 0 ? (
          <Card className="text-center py-12 bg-white/5 border-white/10">
            <CardContent>
              <p className="text-gray-400">No prototypes yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projects as Project[]).map((project) => (
              <Card key={project.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                    <Badge variant="secondary" className="bg-white/10 text-gray-300">
                      v{project.current_version}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-gray-400">
                    {project.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Link href={`/prototypes/${project.slug}`} className="flex-1">
                      <Button className="w-full bg-[#C41230] hover:bg-[#a30f28] text-white border-0">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Prototype
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
