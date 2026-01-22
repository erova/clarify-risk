import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileCode, Zap, BookOpen, ArrowRight, ExternalLink } from "lucide-react";
import { ProtoHubLogo } from "@/components/ProtoHubLogo";

const EXAMPLE_PROMPTS = [
  {
    title: "Create a new list view",
    prompt: `Create a new experiment in wireframe-kit/app/experiments/approvals/page.tsx.

Show a list of pending approvals with: requester name, request type, date, status.
Include a search input and status filter tabs.
Clicking a row opens a right-side detail panel.
Use the existing Card, Button, Input, Divider primitives.
Keep it grayscale, single file, local mock data (10–15 items).`,
  },
  {
    title: "Add an assist nudge pattern",
    prompt: `In the approvals experiment, add a contextual nudge that appears after the user views 3+ items.

The nudge should say "You're reviewing manually — want me to surface the highest-risk items first?"
Clicking the nudge opens a right-side assist panel with suggested actions.
Use useState for all interactivity. No animation libraries.`,
  },
  {
    title: "Create a settings page",
    prompt: `Create wireframe-kit/app/experiments/settings/page.tsx.

Show a form with sections: General, Notifications, Security.
Each section is a Card with form fields (Input, toggles, dropdowns).
Include a "Save changes" button that shows a success message.
Keep styling minimal and grayscale.`,
  },
  {
    title: "Create a modal flow",
    prompt: `Add a "Create new book" flow to the ca-books experiment.

Clicking "Create book" opens a modal with steps:
1. Enter book name and meeting date
2. Select organization from dropdown
3. Confirm and create

Use useState for step tracking. Close modal on completion or backdrop click.
Keep it in the same file unless a component is truly reusable.`,
  },
];

const LIVE_EXAMPLES = [
  {
    name: "Agentic Hero",
    description: "Dashboard with monitoring agents, prompt interface, and activity log",
    href: "/prototypes/agentic-hero",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ProtoHubLogo />
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Resources</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/prototypes">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                Prototypes
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
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30">
            For Designers & AI Tools
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            Wireframe Kit & Getting Started
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to start building prototypes with Claude, Cursor, or ChatGPT. 
            Download the kit, copy a prompt, and start creating.
          </p>
        </div>

        {/* Download Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-[#3b82f6]/20 to-[#8B001E]/10 border-[#3b82f6]/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#3b82f6]/30 rounded-xl flex items-center justify-center">
                    <FileCode className="w-8 h-8 text-[#60a5fa]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1 text-white">Wireframe Kit</h2>
                    <p className="text-gray-400">
                      Self-contained Next.js environment with grayscale primitives
                    </p>
                  </div>
                </div>
                <a href="/wireframe-kit.zip" download>
                  <Button size="lg" className="gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                    <Download className="w-5 h-5" />
                    Download .zip
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="font-bold text-[#60a5fa]">1</span>
                </div>
                <CardTitle className="text-lg text-white">Download & Extract</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Download the wireframe kit zip and extract it to your projects folder.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="font-bold text-[#60a5fa]">2</span>
                </div>
                <CardTitle className="text-lg text-white">Install & Run</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-black/30 text-gray-300 px-2 py-1 rounded block mb-2">
                  npm install && npm run dev
                </code>
                <p className="text-gray-400 text-sm">
                  Open localhost:3000 to see the experiment index.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="w-10 h-10 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="font-bold text-[#60a5fa]">3</span>
                </div>
                <CardTitle className="text-lg text-white">Prompt Claude</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Tell Claude: "Use the wireframe kit to build [your idea]" — copy prompts below for inspiration.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's Inside */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">What's Inside</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-[#3b82f6]" />
                  Wireframe Primitives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Simple, grayscale components designed for rapid prototyping:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white/10 text-gray-300">Button</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-gray-300">Card</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-gray-300">Input</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-gray-300">Divider</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <BookOpen className="w-5 h-5 text-[#3b82f6]" />
                  Example Experiments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Reference patterns you can study and extend:
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• <strong className="text-gray-300">agentic-hero</strong> — Agent status, incident response</li>
                  <li>• <strong className="text-gray-300">ca-books</strong> — List view with detail panel</li>
                  <li>• <strong className="text-gray-300">ca-bookbuilder</strong> — Editor with smart assists</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Design Principles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Design Principles</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: "Grayscale Only", desc: "No brand colors — forces focus on UX" },
              { title: "Self-Contained", desc: "No external dependencies beyond React/Next" },
              { title: "Local Mock Data", desc: "Everything defined inline in each file" },
              { title: "Simple State", desc: "useState only, no complex hooks" },
            ].map((principle) => (
              <Card key={principle.title} className="text-center bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-white mb-1">{principle.title}</h3>
                  <p className="text-sm text-gray-400">{principle.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-2">Example Prompts for Claude</h2>
          <p className="text-gray-400 mb-6">
            Copy these prompts to quickly create new experiments with AI tools.
          </p>
          <div className="space-y-4">
            {EXAMPLE_PROMPTS.map((example, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">{example.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-black/30 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-gray-300 border border-white/10">
                    {example.prompt}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Examples */}
        {LIVE_EXAMPLES.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Live Examples</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LIVE_EXAMPLES.map((example) => (
                <Link key={example.href} href={example.href}>
                  <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">{example.name}</CardTitle>
                      <CardDescription className="text-gray-400">{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-[#60a5fa] flex items-center gap-1">
                        View prototype <ExternalLink className="w-3 h-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section>
          <Card className="text-center py-8 bg-white/5 border-white/10">
            <CardContent>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to prototype?</h2>
              <p className="text-gray-400 mb-6">
                Download the kit and start building with Claude in minutes.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a href="/wireframe-kit.zip" download>
                  <Button size="lg" className="gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                    <Download className="w-5 h-5" />
                    Download Wireframe Kit
                  </Button>
                </a>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built for teams prototyping with AI
        </div>
      </footer>
    </div>
  );
}
