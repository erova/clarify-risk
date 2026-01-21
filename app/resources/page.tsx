import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileCode, Zap, BookOpen, ArrowRight, Copy, ExternalLink } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CR</span>
              </div>
              <span className="font-semibold text-gray-900">Clarify Risk</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Resources</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/prototypes">
              <Button variant="ghost" size="sm">Prototypes</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4">For Designers & AI Tools</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wireframe Kit & Getting Started
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to start building prototypes with Claude, Cursor, or ChatGPT. 
            Download the kit, copy a prompt, and start creating.
          </p>
        </div>

        {/* Download Section */}
        <section className="mb-16">
          <Card className="bg-gray-900 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                    <FileCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Wireframe Kit</h2>
                    <p className="text-gray-300">
                      Self-contained Next.js environment with grayscale primitives
                    </p>
                  </div>
                </div>
                <a href="/wireframe-kit.zip" download>
                  <Button size="lg" variant="secondary" className="gap-2">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="font-bold text-gray-600">1</span>
                </div>
                <CardTitle className="text-lg">Download & Extract</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Download the wireframe kit zip and extract it to your projects folder.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="font-bold text-gray-600">2</span>
                </div>
                <CardTitle className="text-lg">Install & Run</CardTitle>
              </CardHeader>
              <CardContent>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-2">
                  npm install && npm run dev
                </code>
                <p className="text-gray-600 text-sm">
                  Open localhost:3000 to see the experiment index.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <span className="font-bold text-gray-600">3</span>
                </div>
                <CardTitle className="text-lg">Prompt Claude</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Tell Claude: "Use the wireframe kit to build [your idea]" — copy prompts below for inspiration.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What's Inside */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Inside</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-500" />
                  Wireframe Primitives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Simple, grayscale components designed for rapid prototyping:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Button</Badge>
                  <Badge variant="secondary">Card</Badge>
                  <Badge variant="secondary">Input</Badge>
                  <Badge variant="secondary">Divider</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  Example Experiments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Reference patterns you can study and extend:
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>agentic-hero</strong> — Agent status, incident response</li>
                  <li>• <strong>ca-books</strong> — List view with detail panel</li>
                  <li>• <strong>ca-bookbuilder</strong> — Editor with smart assists</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Design Principles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Design Principles</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: "Grayscale Only", desc: "No brand colors — forces focus on UX" },
              { title: "Self-Contained", desc: "No external dependencies beyond React/Next" },
              { title: "Local Mock Data", desc: "Everything defined inline in each file" },
              { title: "Simple State", desc: "useState only, no complex hooks" },
            ].map((principle) => (
              <Card key={principle.title} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1">{principle.title}</h3>
                  <p className="text-sm text-gray-600">{principle.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Example Prompts for Claude</h2>
          <p className="text-gray-600 mb-6">
            Copy these prompts to quickly create new experiments with AI tools.
          </p>
          <div className="space-y-4">
            {EXAMPLE_PROMPTS.map((example, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{example.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap text-gray-700 border">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Examples</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LIVE_EXAMPLES.map((example) => (
                <Link key={example.href} href={example.href}>
                  <Card className="hover:border-gray-400 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">{example.name}</CardTitle>
                      <CardDescription>{example.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-blue-600 flex items-center gap-1">
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
          <Card className="text-center py-8">
            <CardContent>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to prototype?</h2>
              <p className="text-gray-600 mb-6">
                Download the kit and start building with Claude in minutes.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a href="/wireframe-kit.zip" download>
                  <Button size="lg" className="gap-2">
                    <Download className="w-5 h-5" />
                    Download Wireframe Kit
                  </Button>
                </a>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="gap-2">
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
      <footer className="border-t mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built for teams prototyping with AI
        </div>
      </footer>
    </div>
  );
}
