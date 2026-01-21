"use client";

/**
 * Agentic Hero Prototype
 * Demonstrates an agentic dashboard with monitoring agents, prompt interface, and activity log.
 */

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

// Mock Data
const AGENTS = [
  { name: "Entity Monitor", lastRun: "8 min ago", status: "Active" },
  { name: "Policy Drift Watch", lastRun: "31 min ago", status: "Stable" },
  { name: "Third-Party Sentinel", lastRun: "45 min ago", status: "Active" },
  { name: "Investigation Triage", lastRun: "1 hr ago", status: "Standing by" },
];

const RECENT_APPS = [
  { name: "Entities", detail: "Reviewed entity map for structural updates" },
  { name: "Risk Manager", detail: "Checked open items; all risks in normal range" },
  { name: "Policy Manager", detail: "Confirmed policy review cadence is current" },
];

const SUGGESTIONS = [
  "Analyze coverage gaps",
  "Map entity-vendor links",
  "Assess audit readiness",
  "Generate recommendations",
];

const ACTIVITY_LOG = [
  "All monitoring agents completed successfully.",
  "No escalations in the last 24 hours.",
  "Entity inventory synced without changes.",
  "Third-party watchlist refresh completed.",
];

export default function AgenticHeroPrototype() {
  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState("");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-4">
          <Link href="/prototypes" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Prototype
            </span>
            <span className="text-sm font-semibold text-gray-900">Agentic Hero</span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 text-xs font-semibold text-gray-900 border border-gray-300 rounded-full bg-white">
            Steady State
          </span>
          <span className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full">
            Security
          </span>
          <span className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full">
            Whistleblower
          </span>
          <span className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full">
            Compliance
          </span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Everything looks good right now.
          </h1>
          <p className="text-sm text-gray-500">
            Calm periods are a good time to validate coverage, map dependencies, and generate recommendations.
          </p>
        </header>

        {/* Agent Ticker */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Active Agents
              </span>
              <Button variant="outline" size="sm" onClick={() => setActivityOpen(!activityOpen)}>
                {activityOpen ? "Hide Activity" : "View Activity"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {AGENTS.map((agent) => (
                <button
                  key={agent.name}
                  onClick={() => setSelectedAgent(selectedAgent === agent.name ? null : agent.name)}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg cursor-pointer transition-colors ${
                    selectedAgent === agent.name ? "bg-gray-200 border-gray-300" : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-gray-800">{agent.name}</span>
                  <span className="text-gray-500">· {agent.lastRun}</span>
                </button>
              ))}
            </div>

            {/* Agent Detail */}
            {selectedAgent && (
              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold text-gray-900 mb-2">{selectedAgent}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Status: {AGENTS.find((a) => a.name === selectedAgent)?.status}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  This agent monitors for changes and will alert you if action is needed.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit Agent</Button>
                  <Button variant="outline" size="sm">View History</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Log */}
        {activityOpen && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Recent System Activity
                </span>
                <Button variant="outline" size="sm" onClick={() => setActivityOpen(false)}>
                  Close
                </Button>
              </div>
              <ul className="space-y-2">
                {ACTIVITY_LOG.map((entry, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                    {entry}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Separator className="my-6" />

        {/* Prompt Box */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Prompt the AI to get to work
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Use downtime to analyze gaps, generate recommendations, or map coverage.
            </p>
            <Input
              placeholder="e.g., Show me coverage gaps across entities and third parties"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPromptValue(s)}
                  className="px-3 py-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPromptValue("")}>Clear</Button>
              <Button>Run Task</Button>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Recent Apps */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pick up where you left off</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RECENT_APPS.map((app) => (
              <Card key={app.name}>
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{app.name}</p>
                  <p className="text-sm text-gray-600">{app.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p className="mt-10 text-xs text-gray-400 text-center">
          Prototype hosted on Clarify Risk
        </p>
      </main>
    </div>
  );
}
