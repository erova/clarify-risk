# Vibe Sharing Prototype Hub

Host and share AI-generated prototypes with seamless context handoffs.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Prototype Hosting**: Commit prototypes as routes under `/prototypes/[slug]`
- **Context Management**: Track what was built, decisions made, and next steps
- **AI Handoffs**: Export formatted context for Claude to understand where you left off
- **Team Collaboration**: Share prototypes and context with your team

## Adding Prototypes

1. Create a new folder under `app/prototypes/your-prototype-name/`
2. Add a `page.tsx` with your prototype code
3. Create a project in the dashboard with a matching slug
4. Log your context updates as you build

## Project Structure

```
vibesharing/
├── app/
│   ├── (auth)/           # Login/signup pages
│   ├── (dashboard)/      # Protected dashboard routes
│   ├── prototypes/       # Hosted prototypes
│   └── api/              # API routes
├── components/
│   ├── ui/               # Shadcn components
│   ├── ContextTimeline.tsx
│   └── ExportButton.tsx
├── lib/
│   └── supabase/         # Supabase clients
└── types/
```

## Tech Stack

- Next.js 14+ (App Router)
- Tailwind CSS + Shadcn/ui
- Supabase (Auth + Database)
- TypeScript

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set your environment variables in the Vercel dashboard.
