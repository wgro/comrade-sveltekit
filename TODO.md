# Comrade - Implementation TODO

## Phase 1: Project Foundation

- [x] **Initialize SvelteKit project**
  - Create new SvelteKit app with TypeScript
  - Configure for Node adapter (not static)
  - Set up strict TypeScript config
  - Add path aliases (`$lib/server/*`)

- [x] **Install core dependencies**
  - Prisma and SQLite
  - sidequest + @sidequest/mongo-backend
  - @google/generative-ai
  - @mozilla/readability + jsdom
  - feedsmith for RSS parsing
  - concurrently (dev dependency)

- [ ] **Set up environment configuration**
  - Create `mise.local.toml` with GEMINI_API_KEY
  - Configure SvelteKit to load env vars
  - Create `.env.example` for documentation

---

## Phase 2: Database Layer

- [x] **Create Prisma connection singleton**
  - Handle connection in `src/lib/server/db/connection.ts`

- [x] **Define models**
  - Publisher (name, slug, type, baseUrl, active)
  - Feed (publisher ref, name, languageCode, languageName, url, polling metadata)
  - Story (feed ref, guid, original/translated content, status, timestamps, contentType)

- [x] **Connect DB on app startup**
  - Call `connectDB()` in root `src/hooks.server.ts`

- [x] **Create seed script**
  - Add RFE/RL as primary publisher
  - Seed 3-5 language service feeds for testing (e.g., Ukrainian, Russian, Uzbek)

---

## Phase 3: Core Services

- [x] **RSS parsing service**
  - Wrap feedsmith with error handling
  - Return normalized feed entries (guid, title, link, pubDate)

- [x] **Content extraction service**
  - Fetch page HTML with fetch
  - Parse with jsdom + Readability
  - Return title, content, author, image
  - Handle extraction failures gracefully

- [x] **LLM client**
  - Create unified Gemini client in `src/lib/server/services/llm.ts`
  - Wrapper for chat completions with retry logic
  - Configurable model selection

- [x] **Translation service**
  - Accept text + source language
  - Prompt Gemini to translate to English
  - Return translated text

- [x] **Summarization service**
  - Accept English text
  - Prompt Gemini for concise summary
  - Return summary

---

## Phase 4: Background Jobs

- [ ] **Set up Sidequest worker entry point**
  - Create `worker/index.ts`
  - Initialize Sidequest with mongo-backend
  - Connect to MongoDB before starting

- [ ] **Implement PollFeedJob**
  - Fetch RSS for a single feed
  - Compare entries against existing Stories (by guid)
  - Create Story documents for new entries (status: 'pending')
  - Enqueue FetchStoryJob for each new Story

- [ ] **Implement FetchStoryJob**
  - Load Story by ID
  - Call extraction service on sourceUrl
  - Update Story with content, set status: 'fetched'
  - Enqueue TranslateStoryJob

- [ ] **Implement TranslateStoryJob**
  - Load Story by ID
  - Call translation service with original content
  - Update Story with translated content, set status: 'translated'
  - Enqueue SummarizeStoryJob

- [ ] **Implement SummarizeStoryJob**
  - Load Story by ID
  - Call summarization service with translated content
  - Update Story with summary, set status: 'summarized'

- [ ] **Implement PollAllFeedsJob**
  - Query all active feeds
  - Enqueue PollFeedJob for each
  - Use job uniqueness to prevent duplicates

- [ ] **Set up scheduled polling**
  - Schedule PollAllFeedsJob to run every 15 minutes
  - Verify schedule persists across worker restarts

- [ ] **Add npm scripts**
  - `dev:worker` - Run worker with tsx watch
  - `dev:all` - Run SvelteKit + worker concurrently

---

## Phase 5: Web UI - Read Views

- [ ] **Dashboard page (`/`)**
  - Show recent stories count
  - Show processing stats (pending, fetched, translated, summarized, failed)
  - Link to feeds and stories

- [ ] **Stories list (`/stories`)**
  - List stories with status badges
  - Show original title + translated title (if available)
  - Filter by feed, status, date range
  - Pagination

- [ ] **Story detail (`/stories/[id]`)**
  - Display original and translated content side-by-side
  - Show summary
  - Show metadata (source, published date, language)
  - Link to original article

- [ ] **Feeds list (`/feeds`)**
  - List all feeds grouped by publisher
  - Show last polled time, error status
  - Active/inactive toggle

---

## Phase 6: Web UI - Management

- [ ] **Feed management**
  - Add new feed form (select publisher, enter URL, language)
  - Edit feed (URL, poll interval, active status)
  - Delete feed (soft delete or cascade?)

- [ ] **Publisher management**
  - Add competitor publisher
  - Edit publisher details

- [ ] **Manual actions**
  - Button to manually poll a feed
  - Button to retry failed story processing
  - Button to reprocess a story (re-translate, re-summarize)

---

## Phase 7: Error Handling & Monitoring

- [ ] **Job failure handling**
  - Ensure failed jobs update Story status to 'failed'
  - Store error message on Story for debugging
  - Configure retry attempts and backoff

- [ ] **Feed error tracking**
  - Track last error on Feed model
  - Surface feeds with repeated failures in UI

- [ ] **Sidequest dashboard**
  - Verify dashboard is accessible at :8678
  - Review queue depths, failed jobs

---

## Phase 8: Deployment

- [ ] **Prepare for production**
  - Build SvelteKit with Node adapter
  - Compile worker TypeScript to JavaScript
  - Test production builds locally

- [ ] **VPS setup**
  - Install Node.js, MongoDB
  - Configure MongoDB authentication
  - Set up firewall rules

- [ ] **Process management**
  - Configure PM2 for both processes
  - SvelteKit app (port 3000)
  - Sidequest worker
  - Set up log rotation

- [ ] **Reverse proxy**
  - Nginx or Caddy in front of SvelteKit
  - SSL certificate (Let's Encrypt)

---

## Future Phases (Not Now)

- [ ] Publisher-specific extractors (RFE/RL, BBC patterns)
- [ ] Video content support (transcript extraction)
- [ ] Newsletter ingestion
- [ ] Real-time updates via SSE
- [ ] Search functionality
- [ ] Export/API access to processed stories
- [ ] User authentication (if needed)
