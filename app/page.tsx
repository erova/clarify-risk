import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtoHubLogo } from "@/components/ProtoHubLogo";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <ProtoHubLogo />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Prototype Hub for AI-Powered Teams
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Host your vibe-coded prototypes and solve the AI context handoff problem. 
            When Designer A finishes work, Designer B picks up seamlessly.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0">
                Start Prototyping
              </Button>
            </Link>
            <Link href="/prototypes">
              <Button variant="outline" size="lg" className="text-lg px-8 border-white/20 text-white hover:bg-white/10">
                Browse Prototypes
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="ghost" size="lg" className="text-lg px-8 text-gray-400 hover:text-white hover:bg-white/5">
                Get the Kit
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Host Prototypes</h3>
            <p className="text-gray-400">
              Your team commits prototypes directly to the repo. Each one gets a shareable URL.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Seamless Handoffs</h3>
            <p className="text-gray-400">
              Track what was built, decisions made, and next steps. Claude understands where you left off.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 bg-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
            <p className="text-gray-400">
              Share context with your whole team. Export formatted notes for Claude in one click.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Build with Claude", desc: "Create prototypes using AI tools" },
              { step: "2", title: "Commit to repo", desc: "Push your prototype code" },
              { step: "3", title: "Log your context", desc: "Document what you built and why" },
              { step: "4", title: "Share with team", desc: "Next person picks up seamlessly" },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-10 h-10 bg-[#3b82f6] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-32 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built for teams prototyping with AI
        </div>
      </footer>
    </div>
  );
}
