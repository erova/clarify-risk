import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

// Available starter templates
const TEMPLATES = {
  "html-tailwind": {
    name: "HTML + Tailwind",
    description: "Simple static prototype with Tailwind CSS",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PROJECT_NAME}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#3b82f6',
            secondary: '#1e293b',
          }
        }
      }
    }
  </script>
  <style type="text/tailwindcss">
    @layer utilities {
      .text-gradient {
        @apply bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500;
      }
    }
  </style>
</head>
<body class="bg-slate-900 text-white min-h-screen">
  <div class="container mx-auto px-4 py-16">
    <h1 class="text-4xl font-bold text-gradient mb-4">{{PROJECT_NAME}}</h1>
    <p class="text-slate-400 mb-8">Start building your prototype here!</p>
    
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 class="text-xl font-semibold mb-2">Card Title</h2>
        <p class="text-slate-400">Add your content here.</p>
      </div>
      <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 class="text-xl font-semibold mb-2">Another Card</h2>
        <p class="text-slate-400">Build something amazing.</p>
      </div>
    </div>
    
    <button class="mt-8 px-6 py-3 bg-primary hover:bg-blue-600 rounded-lg font-medium transition-colors">
      Get Started
    </button>
  </div>
  
  <script src="script.js"></script>
</body>
</html>`,
      "script.js": `// Add your JavaScript here
console.log('{{PROJECT_NAME}} loaded!');

// Example: Add interactivity
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Button clicked!');
  });
});
`,
      "README.md": `# {{PROJECT_NAME}}

A prototype built with Proto Hub.

## Getting Started

1. Open \`index.html\` in your browser to preview
2. Edit the files in Cursor or your favorite editor
3. When ready, upload this folder as a ZIP to Proto Hub to deploy

## Files

- \`index.html\` - Main HTML file with Tailwind CSS
- \`script.js\` - JavaScript for interactivity
- \`CLAUDE.md\` - Context for AI assistants
`,
      "CLAUDE.md": `# Claude Context: {{PROJECT_NAME}}

This is a prototype created through **Proto Hub** (vibesharing) - a platform for design teams to build, share, and hand off interactive prototypes.

## What This Project Is

This is an HTML + Tailwind CSS prototype. It's meant for rapid experimentation and visualization of UI concepts, not production code.

## Project Structure

\`\`\`
├── index.html    # Main HTML file with Tailwind CSS (via CDN)
├── script.js     # JavaScript for interactivity
├── README.md     # Project documentation
└── CLAUDE.md     # This file - context for AI assistants
\`\`\`

## How to Help Build This Prototype

When the user asks you to help with this prototype:

1. **Focus on visual fidelity** - This is a prototype, so prioritize how things look and feel over production concerns
2. **Use Tailwind CSS** - All styling should use Tailwind utility classes (loaded via CDN)
3. **Keep it simple** - Single HTML file with inline Tailwind is fine. Add script.js for interactivity
4. **Dark theme by default** - The starter uses a dark slate color scheme
5. **Be creative** - Prototypes are for exploration. Suggest improvements and alternatives

## Design System

The starter includes these custom Tailwind extensions:
- \`primary\`: #3b82f6 (blue)
- \`secondary\`: #1e293b (dark slate)
- \`text-gradient\`: Blue to purple gradient text

## When Complete

When the user is happy with the prototype, they will:

1. **ZIP this folder** (or let Proto Hub do it)
2. **Upload to Proto Hub** to deploy it live
3. **Share the link** with their team for feedback

The deployed prototype will be hosted on Vercel and accessible via a unique URL.

## Proto Hub Context

Proto Hub tracks:
- **Projects** - Concepts being explored (e.g., "Dashboard Redesign")
- **Prototypes** - Individual versions by different people (e.g., "Sarah's dark mode v2")
- **Context History** - Notes about decisions made, known issues, next steps

When handing off, encourage the user to document:
- What was built and why
- Key decisions made
- Known issues or limitations
- Suggested next steps
`,
    },
  },
  "nextjs-tailwind": {
    name: "Next.js + Tailwind",
    description: "React-based prototype with Next.js and Tailwind",
    files: {
      "package.json": `{
  "name": "{{PROJECT_SLUG}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "tailwindcss": "3.3.0",
    "postcss": "8.4.31",
    "autoprefixer": "10.4.16"
  }
}`,
      "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for easy deployment
}

module.exports = nextConfig
`,
      "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
    },
  },
  plugins: [],
}
`,
      "postcss.config.js": `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
      "app/layout.tsx": `import './globals.css'

export const metadata = {
  title: '{{PROJECT_NAME}}',
  description: 'A prototype built with Proto Hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
`,
      "app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
      "app/page.tsx": `export default function Home() {
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
        {{PROJECT_NAME}}
      </h1>
      <p className="text-slate-400 mb-8">Start building your prototype here!</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-2">Card Title</h2>
          <p className="text-slate-400">Add your content here.</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-2">Another Card</h2>
          <p className="text-slate-400">Build something amazing.</p>
        </div>
      </div>
      
      <button className="mt-8 px-6 py-3 bg-primary hover:bg-blue-600 rounded-lg font-medium transition-colors">
        Get Started
      </button>
    </main>
  )
}
`,
      "README.md": `# {{PROJECT_NAME}}

A Next.js prototype built with Proto Hub.

## Getting Started

1. Run \`npm install\` to install dependencies
2. Run \`npm run dev\` to start the development server
3. Open [http://localhost:3000](http://localhost:3000) in your browser
4. Edit \`app/page.tsx\` to build your prototype

## Files

- \`app/page.tsx\` - Main page component
- \`app/layout.tsx\` - Root layout with metadata
- \`app/globals.css\` - Global styles and Tailwind imports
- \`CLAUDE.md\` - Context for AI assistants

## Deployment

When ready, you can either:
- Upload this folder as a ZIP to Proto Hub
- Push to GitHub and connect via Proto Hub
`,
      "CLAUDE.md": `# Claude Context: {{PROJECT_NAME}}

This is a prototype created through **Proto Hub** (vibesharing) - a platform for design teams to build, share, and hand off interactive prototypes.

## What This Project Is

This is a Next.js + Tailwind CSS prototype. It's meant for rapid experimentation and visualization of UI concepts, not production code.

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx        # Main page component - START HERE
│   ├── layout.tsx      # Root layout with metadata
│   └── globals.css     # Tailwind imports and global styles
├── package.json        # Dependencies (Next.js, React, Tailwind)
├── tailwind.config.js  # Tailwind configuration
├── next.config.js      # Next.js config (static export enabled)
├── README.md           # Project documentation
└── CLAUDE.md           # This file - context for AI assistants
\`\`\`

## How to Help Build This Prototype

When the user asks you to help with this prototype:

1. **Focus on visual fidelity** - This is a prototype, so prioritize how things look and feel over production concerns
2. **Use Tailwind CSS** - All styling should use Tailwind utility classes
3. **Keep components simple** - Create new components in \`app/components/\` if needed
4. **Dark theme by default** - The starter uses a dark slate color scheme (bg-slate-900)
5. **Be creative** - Prototypes are for exploration. Suggest improvements and alternatives
6. **Use React patterns** - useState, useEffect, etc. are fine for interactivity

## Design System

The Tailwind config includes:
- \`primary\`: #3b82f6 (blue) - use for buttons and accents
- Dark slate backgrounds (slate-800, slate-900)
- Gradient text with \`bg-clip-text text-transparent bg-gradient-to-r\`

## Running the Project

\`\`\`bash
npm install    # First time only
npm run dev    # Start dev server at localhost:3000
\`\`\`

## When Complete

When the user is happy with the prototype, they will:

1. **ZIP this folder** (excluding node_modules)
2. **Upload to Proto Hub** to deploy it live
3. **Share the link** with their team for feedback

The deployed prototype will be hosted on Vercel and accessible via a unique URL.

## Proto Hub Context

Proto Hub tracks:
- **Projects** - Concepts being explored (e.g., "Dashboard Redesign")
- **Prototypes** - Individual versions by different people (e.g., "Sarah's dark mode v2")
- **Context History** - Notes about decisions made, known issues, next steps

When handing off, encourage the user to document:
- What was built and why
- Key decisions made
- Known issues or limitations
- Suggested next steps

## Common Tasks

**Add a new page:**
Create \`app/new-page/page.tsx\`

**Add a component:**
Create \`app/components/MyComponent.tsx\` and import it

**Add interactivity:**
Use \`"use client"\` at the top of the file, then useState/useEffect

**Add an icon library:**
Suggest lucide-react: \`npm install lucide-react\`
`,
    },
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template");
  const projectName = searchParams.get("name") || "My Prototype";
  const projectSlug = searchParams.get("slug") || "my-prototype";

  // List available templates
  if (!template) {
    return NextResponse.json({
      templates: Object.entries(TEMPLATES).map(([id, t]) => ({
        id,
        name: t.name,
        description: t.description,
      })),
    });
  }

  // Generate ZIP for specific template
  const templateData = TEMPLATES[template as keyof typeof TEMPLATES];
  if (!templateData) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const zip = new JSZip();

  // Add files with variable substitution
  for (const [path, content] of Object.entries(templateData.files)) {
    const processedContent = content
      .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
      .replace(/\{\{PROJECT_SLUG\}\}/g, projectSlug);
    zip.file(path, processedContent);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  return new Response(zipBlob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectSlug}-starter.zip"`,
    },
  });
}
