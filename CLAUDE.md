# Comrade - Project Context

## Overview

Comrade is a SvelteKit application that aggregates news content from Radio Free Europe/Radio Liberty (RFE/RL) language services and competitor outlets. It automatically fetches articles via RSS, extracts full content, translates to English, and generates summaries.

## Tech Stack

- **Framework**: SvelteKit with TypeScript (strict mode)
- **Runtime**: Bun
- **Database**: SQLite with Prisma ORM
- **Background Jobs**: Sidequest with `@sidequest/sqlite-backend`
- **LLM Provider**: Google Gemini (for translation and summarization)
- **Content Extraction**: Mozilla Readability (`@mozilla/readability`) + jsdom
- **Deployment**: Single VPS running SvelteKit (Node adapter) + Sidequest worker as separate processes

## Guidelines

- Use `bun` instead of `npm`
- Use the "Comrade SQLite Server" to introspect the SQLite database
- Use the Svelte MCP server to reference Svelte and SvelteKit docs
- Prefer experimental SvelteKit remote functions instead of "load" functions
- Check Context7 MCP for SvelteKit remote functions documentation
- Put remote functions in src/lib/api, and remember they must have a .remote.ts ending
- Always use context7 when I need code generation, setup or configuration steps, or
  library/API documentation. This means you should automatically use the Context7 MCP
  tools to resolve library id and get library docs without me having to explicitly ask
- Use the Comrade and Sidequest MCP servers when working with database operations to introspect
- Utilize BEM CSS naming, and keep classes and ids short and simple
- Do not use Tailwind
- When asked to create frontend code, do very basic styling, because the user will redo it later anyway
- Do not run `bun run dev`

## Architecture

### Two-Process Model

1. **SvelteKit App** (`bun run dev`) - Web UI, API routes, job enqueuing
2. **Sidequest Worker** Started in src/hooks.server.ts when the server is started

Both processes share:

- SQLite database (storage/comrade.db for app, storage/sidequest.db for jobs)
- Domain code in `src/lib/server/`

### Job Pipeline

```
PollAllFeedsJob (scheduled every 15 min)
    └─► PollFeedJob (per feed)
            └─► FetchStoryJob (per new entry)
                    └─► TranslateStoryJob
                            └─► SummarizeStoryJob
```

Each job chains to the next on success. Failed jobs use Sidequest's built-in retry with exponential backoff.

## Project Structure

```
comrade/
├── prisma/
│   └── schema.prisma         # Prisma schema definition
├── storage/                  # SQLite databases (gitignored)
│   ├── comrade.db            # App database
│   └── sidequest.db          # Job queue database
├── src/
│   ├── lib/
│   │   ├── server/           # Server-only code (DB, services)
│   │   │   ├── db/
│   │   │   │   ├── connection.ts  # Prisma client
│   │   │   │   ├── generated/     # Prisma generated client
│   │   │   │   └── models/        # Type exports & constants
│   │   │   └── services/
│   │   │       ├── rss/
│   │   │       ├── extraction/
│   │   │       ├── translation/
│   │   │       ├── summarization/
│   │   │       └── llm.ts    # Unified Gemini client
│   │   └── components/
│   └── routes/
├── worker/
│   ├── index.ts              # Worker entry point
│   ├── jobs/                 # Job classes
│   └── schedules.ts
├── scripts/
│   └── seed.ts               # Seed RFE/RL feeds
└── prisma.config.ts          # Prisma CLI configuration
```

## Data Models

### Publisher

News organizations (RFE/RL, BBC, etc.). Has `type`: 'primary' or 'competitor'.

### Feed

Individual RSS feeds belonging to a Publisher. Tracks language, poll interval, last poll time, errors.

### Story

The core content entity. Tracks processing status: `pending` → `fetched` (or `failed`).

Key fields:

- `guid`: RSS entry GUID for deduplication
- `originalTitle`, `originalContent`, `originalLanguage`
- `status`: Processing state for content fetching
- `contentType`: 'article' | 'video' | 'newsletter' (for future expansion)

### Translation

Translations of stories. Supports multiple translations per story (different target languages).

Key fields:

- `storyId`: Reference to parent Story
- `targetLanguage`: Target language code (default: 'en')
- `translatedTitle`, `translatedContent`
- `status`: 'pending' | 'completed' | 'failed'
- LLM metadata: `modelName`, `tokenCount`, `generatedAt`

### Summary

Summaries of stories. Supports multiple summaries per story (different types/lengths).

Key fields:

- `storyId`: Reference to parent Story
- `summaryType`: 'brief' | 'detailed' | 'bullets'
- `content`: The summary text
- `status`: 'pending' | 'completed' | 'failed'
- LLM metadata: `modelName`, `tokenCount`, `generatedAt`

## Conventions

### TypeScript

- Strict mode enabled
- Explicit return types on all functions
- Use Prisma generated types (Publisher, Feed, Story, Translation, Summary)
- Use `unknown` over `any`, narrow with type guards

### Prisma

- Schema in `prisma/schema.prisma`
- Generated client in `src/lib/server/db/generated/`
- Use `prisma` client from `$lib/server/db/connection`
- Type constants in `$lib/server/db/models` (e.g., `StoryStatus.PENDING`)

### Sidequest Jobs

- One job class per file in `worker/jobs/`
- Job names match class names (e.g., `FetchStoryJob`)
- Jobs receive IDs, not full documents (fetch fresh in `run()`)
- Chain jobs by enqueuing next job at end of `run()`

### Services

- Pure functions where possible
- Services don't import Prisma client directly; receive data as arguments
- Extraction service uses strategy pattern for future publisher-specific extractors

### Error Handling

- Jobs should throw on unrecoverable errors (Sidequest handles retry)
- Log errors with context: `console.error('FetchStoryJob failed', { storyId, error })`
- Update Story status to 'failed' with error message for visibility in UI

## Database Commands

```bash
bun run db:generate  # Generate Prisma client after schema changes
bun run db:push      # Push schema changes to database (development)
bun run db:studio    # Open Prisma Studio GUI
bun run db:seed      # Seed initial data
```

## Environment Variables

```
GEMINI_API_KEY=your-api-key
NODE_ENV=development
```

## Key Dependencies

```json
{
	"prisma": "^7.x",
	"@prisma/client": "^7.x",
	"@prisma/adapter-libsql": "^7.x",
	"sidequest": "latest",
	"@sidequest/sqlite-backend": "latest",
	"@mozilla/readability": "^0.6.x",
	"jsdom": "^27.x",
	"@google/genai": "latest",
	"feedsmith": "latest"
}
```

## Future Expansion

The `contentType` field on Story is designed for future support of:

- **Videos**: Extract transcript, translate, summarize
- **Newsletters**: Poll email inbox or web archives

Publisher-specific extractors can be added in `src/lib/server/services/extraction/` following the strategy pattern.
