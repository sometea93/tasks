# Task Manager with NLP

A cross-platform task management application with natural language processing. Create, prioritize, and schedule tasks using natural language commands.

## Features

- Natural language task creation ("Meeting with Pedro tomorrow at 3pm, urgent")
- Real-time task classification while typing
- Cross-device synchronization via Supabase Realtime
- Priority levels (High/Normal/Low)
- Due dates and recurring tasks
- User authentication (email/password and OAuth)

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL with Row Level Security)
- **NLP**: OpenAI API (gpt-4o-mini with structured outputs)
- **Deployment**: Vercel

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_create_tasks.sql`
3. Enable Email auth and optionally Google/GitHub OAuth providers

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Run Development Server

```bash
npm run dev
```

## Deployment to Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add the environment variables in Vercel's project settings
4. Deploy

## Project Structure

```
src/
├── app.html, app.css, app.d.ts
├── hooks.server.ts              # Session handling
├── lib/
│   ├── components/
│   │   ├── tasks/               # TaskInput, TaskList, TaskItem, TaskPreview
│   │   ├── ui/                  # Button, Badge, Spinner
│   │   └── auth/                # LoginForm, AuthGuard
│   ├── server/
│   │   └── openai.ts            # OpenAI client with structured outputs
│   ├── services/
│   │   ├── task-service.ts      # CRUD operations
│   │   ├── nlp-service.ts       # NLP API client
│   │   └── realtime-manager.ts  # Supabase Realtime subscriptions
│   ├── stores/
│   │   ├── tasks.ts             # Task state management
│   │   └── auth.ts              # Auth state management
│   ├── types/
│   │   ├── task.ts
│   │   ├── nlp-response.ts
│   │   └── database.types.ts
│   ├── utils/
│   │   └── debounce.ts
│   └── supabase.ts              # Supabase client factory
├── routes/
│   ├── +layout.svelte, +layout.server.ts, +layout.ts
│   ├── +page.svelte, +page.server.ts    # Dashboard
│   ├── auth/                            # Login, callback, logout
│   └── api/parse-task/+server.ts        # NLP endpoint
└── supabase/
    └── migrations/001_create_tasks.sql
```

## Usage

1. Sign up or log in
2. Type a task in natural language: "Call mom tomorrow at 5pm"
3. The system extracts: title, priority, due date, and recurrence
4. Press Enter or click Add to create the task
5. Click the circle to complete a task (hides from view, preserved in DB)
