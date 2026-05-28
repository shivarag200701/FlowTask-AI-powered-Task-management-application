# Product Roadmap

This document outlines every feature required to take this application from its current state to a production-grade, AI-enhanced task management system. Features are ordered by dependency — each phase builds on the previous.

---

## Phase 1: Complete Core Product

These features must be in place before AI integration. They fill gaps in the current product that AI features depend on and that users expect from any serious task management app.

---

### [X] 1.1 Finish the Upcoming View

**Status:** In progress (`feature/upcoming` branch)

**Description:**
Complete the 7-day upcoming board view that lets users see and manage future tasks across a scrollable date range.

**What needs to be done:**

[x] Lift `useUpcomingDateRange` state up to the `Upcoming` page so `TaskPaginationControls` and `BoardView` share the same date range state
[x] Render task cards within each date column in the `BoardView`
[x] Wire up drag-and-drop reordering between date columns (reassigns `dueDate` on drop)
[ ] Handle empty states per column
[ ] Connect the `TaskDisplaySelector` to toggle between list and board layouts(Skipped for now , lets do this in the next feature roll out)

**Key files:**

- `frontend/src/pages/Upcoming.tsx`
- `frontend/src/features/upcoming/components/BoardView.tsx`
- `frontend/src/features/upcoming/components/TaskPaginationControls.tsx`
- `frontend/src/hooks/use-upcoming-date-range.ts`

**Dependencies:** None — this is the current work.

---

### [X] 1.2 Subtasks (Parent-Child Task Hierarchy)

**Description:**
Allow tasks to have child tasks (subtasks). A parent task like "Prepare for interview" can be broken into "Review data structures," "Practice system design," etc.

**Why it's needed:**

- Core product feature users expect
- Required for the AI Task Breakdown agent (Phase 2) — without subtasks, the agent has nowhere to write its output
- Enables progress tracking (3/5 subtasks complete)

**Data model changes:**

```
Todo model additions:
  - parentId    String?   @relation("SubTasks", fields: [parentId], references: [id])
  - parent      Todo?     @relation("SubTasks")
  - subtasks    Todo[]    @relation("SubTasks")
```

**API changes (v2):**

[X]`POST /api/v2/todo` — accept optional `parentId` field
[ ]`GET /api/v2/todo/:id/subtasks` — fetch subtasks for a parent (excluded this for now)
[X]`GET /api/v2/todo` — include subtask count in response, include subtasks from top-level list to also show them in the list

**Frontend:**

[X]Expandable subtask list within a task card
[X]"Add subtask" button on task detail/edit view
[X]Progress indicator on parent tasks (e.g., "2/4 done")
[X]Subtask completion should not auto-complete the parent (user decides when parent is done)

**Validation rules:**

[X]Max nesting depth: 1 level (subtasks cannot have subtasks) (Have implemented in backend , but frontend does allow it, but it fails on creation)
[X]Deleting a parent task deletes all subtasks
[X]Completing a parent task completes all incomplete subtasks

**Dependencies:** None.

---

### [ ] 1.3 Search

**Description:**
Full-text search across all tasks using Meilisearch as a dedicated search engine.

**Why it's needed:**

- Basic product expectation — users with 100+ tasks need to find things fast
- Foundation for AI-powered semantic search later (Phase 3+)

**What's been built (backend):**

A dedicated `MeilisearchService` class (`backend/src/services/search/MeilisearchService.ts`) manages a `todos` index with the following configuration:

- **Indexed document (`TodoDocument`):** `id`, `title`, `description`, `tagNames`, `userId`, `completed`, `priority`, `parentId`, `dueDate`, `createdAt`
- **Searchable attributes:** `title`, `description`, `tagNames`
- **Filterable attributes:** `userId`, `completed`, `priority`, `parentId`
- **Sortable attributes:** `createdAt`, `dueDate`

Service methods:

[x]`upsertTodo(todo, tagNames)` — upsert a single document
[x]`deleteTodo(todoId)` — delete a single document
[x]`deleteTodos(todoIds)` — batch delete
[x]`search(userId, query)` — full-text search filtered by `userId`
[x]`bulkUpsert(documents)` — batch upsert

**API (v2):**

[x]`GET /api/v2/todo/search?q=searchterm` — full-text search via Meilisearch, filtered to the authenticated user
[x]`POST /api/v2/todo/search/reindex` — reindex all of a user's todos into Meilisearch

**Sync integration:**

Meilisearch is kept in sync with Postgres via fire-and-forget `.catch()` calls in the route handlers:

[x]`POST /api/v2/todo` — `upsertTodo` on create
[x]`PATCH /api/v2/todo/:id` — `upsertTodo` on update + `bulkUpsert` for child todos
[x]`DELETE /api/v2/todo/:id` — `deleteTodos` for the task and its children
[x]`DELETE /api/v2/todo/bulk` — `deleteTodos` for bulk-deleted tasks and children
[x]`PATCH /api/v2/todo/bulk` — `bulkUpsert` for bulk-updated tasks

**Frontend:**

[x]Search input in the sidebar or top navigation
[x]Results displayed as a filtered task list
[x]Debounced input (300ms) to avoid excessive API calls
[x]Highlight matching text in results
[x]Empty state: "No tasks match your search"

#### TODO Later: Migrate to Queue-Based Sync

The current Meilisearch sync uses a fire-and-forget `.catch()` pattern directly in route handlers. This works but has drawbacks: failed syncs are only logged (not retried), and sync logic is scattered across route files. In a future iteration, replace this with a **BullMQ queue + worker model** (similar to the existing notification queue pattern):

[ ]Create a `search-sync` BullMQ queue
[ ]Route handlers enqueue sync jobs (`upsert`, `delete`, `bulkUpsert`) instead of calling `MeilisearchService` directly
[ ]A dedicated worker processes sync jobs with automatic retries and backoff
[ ]Centralizes all sync logic in one place and makes failures recoverable

**Dependencies:** None.

---

### [ ] 1.4 Completed Tasks View

**Description:**
A dedicated view to see tasks that have been marked as complete, with the ability to restore them.

**Why it's needed:**

- Currently, completed tasks disappear from the UI with no way to review them
- Users need to verify what they've accomplished
- Required for the AI Weekly Review agent (Phase 3) — it needs visible completion history to generate meaningful insights
- Supports undo: accidentally marking something complete isn't catastrophic

**API changes (v2):**

[ ]`GET /api/v2/todo?completed=true` — filter for completed tasks
[ ]`GET /api/v2/todo?completed=true&from=2026-05-01&to=2026-05-17` — date range filter on `completedAt`
[ ]Response should include `completedAt` timestamp

**Frontend:**

[ ]New route: `/app/completed`
[ ]Sidebar nav link
[ ]Group completed tasks by completion date (Today, Yesterday, This Week, Older)
[ ]"Restore" action to mark a task as incomplete again
[ ]"Delete permanently" action
[ ]Task count in the header

**Dependencies:** None.

---

### [ ] 1.5 Recurring Tasks

**Description:**
Tasks that automatically regenerate on a schedule (daily, weekly, monthly, custom).

**Why it's needed:**

- Core feature for any production todo app (daily standup, weekly review, pay rent monthly)
- Was in v1 and intentionally removed to stabilize the data model — time to bring it back with a cleaner design
- AI scheduling features (Phase 3) need to understand recurring patterns

**Data model changes:**

```
Todo model additions:
  - recurrenceRule    String?    // RRULE format (RFC 5545): "FREQ=WEEKLY;BYDAY=MO,WE,FR"
  - recurrenceEnd    DateTime?  // Optional end date for the recurrence
  - isRecurring      Boolean    @default(false)
```

**Recurrence strategy:**

- Use the "generate next on completion" pattern: when a recurring task is completed, a BullMQ job creates the next instance with the appropriate due date
- Do NOT pre-generate all future instances — this avoids data bloat and simplifies editing
- Each generated instance is a standalone task with no link to previous instances (keeps the model simple)
- If a user edits the recurrence rule, it only affects future instances

**API changes (v2):**

[ ]`POST /api/v2/todo` — accept `recurrenceRule`, `recurrenceEnd`, `isRecurring`
[ ]`PATCH /api/v2/todo/:id` — when completing a recurring task, trigger next instance generation
[ ]`DELETE /api/v2/todo/:id?deleteAll=true` — stop recurrence and delete future scheduled jobs

**Frontend:**

[ ]Recurrence picker in task creation/edit: None, Daily, Weekly, Monthly, Custom
[ ]Custom picker: select days of week, interval (every N days/weeks/months)
[ ]Visual indicator on recurring tasks (repeat icon)
[ ]"Stop recurring" option in task menu
[ ]Recurrence label display (e.g., "Every Monday, Wednesday, Friday")

**BullMQ integration:**

[ ]On task completion, if `isRecurring` is true, add a job to generate the next task instance
[ ]Calculate next due date from `recurrenceRule` using a library like `rrule`

**Dependencies:** None.

---

## Phase 2: AI Integration

These features add intelligent automation using the Claude API for structured JSON generation. They transform the app from a manual CRUD tool into a smart assistant.

**Shared infrastructure for all Phase 2 features:**

[ ]Install `@anthropic-ai/sdk` in the backend
[ ]Create `/api/v2/ai/` route group
[ ]Create a shared `AIService` class in `/backend/src/services/ai/AIService.ts` that wraps Claude API calls with:

- Consistent error handling and retries
- Token usage logging
- Response parsing and validation against Zod schemas
  [ ]Store `ANTHROPIC_API_KEY` in environment variables

---

### [ ] 2.1 Natural Language Task Creation

**Description:**
Users type a freeform sentence and the AI extracts structured task data — title, due date, due time, priority, tags, and description.

**Why it's needed:**

- The single highest-impact AI feature for daily usability
- Dramatically reduces friction for task entry (one text input vs. 5+ form fields)
- Demonstrates practical AI integration without complex infrastructure

**How it works:**

1. User types: `"Submit tax forms by Friday 5pm, high priority #finance"`
2. Frontend sends `POST /api/v2/ai/parse-task` with `{ input: "..." }`
3. Backend sends the input to Claude with a system prompt instructing structured JSON output
4. Claude returns:
   ```json
   {
     "title": "Submit tax forms",
     "dueDate": "2026-05-22",
     "dueTime": "17:00",
     "priority": "high",
     "tags": ["finance"],
     "isAllDay": false
   }
   ```
5. Backend validates against `CreateTodoSchema`, resolves tag names to existing tag IDs (or creates new tags)
6. Returns the parsed payload to the frontend
7. Frontend shows a preview — user confirms or edits before saving

**API:**

[ ]`POST /api/v2/ai/parse-task` — accepts `{ input: string }`, returns parsed `CreateTodo` payload
[ ]The frontend then calls the existing `POST /api/v2/todo` to actually create the task

**Frontend:**

[ ]"Quick add" input bar (always visible at top of task list or via keyboard shortcut)
[ ]Preview card showing parsed fields before confirmation
[ ]Editable preview: user can correct any field the AI got wrong
[ ]Fallback: if parsing fails, just use the raw text as the title

**Prompt engineering notes:**

[ ]Include the user's existing tag list in the system prompt so the AI maps to existing tags
[ ]Include the current date/time so relative dates ("tomorrow," "next week") resolve correctly
[ ]Use Claude's structured output / tool use to enforce the JSON schema

**Dependencies:** None — uses existing `CreateTodo` flow.

---

### [ ] 2.2 AI Task Breakdown

**Description:**
A "Break it down" button on any task that uses AI to generate 3-6 actionable subtasks.

**Why it's needed:**

- Solves "task paralysis" — large vague tasks like "Learn Kubernetes" become actionable steps
- Showcases agentic AI behavior: the system reads a task, reasons about it, and writes structured data back

**How it works:**

1. User clicks "Break it down" on a task
2. Frontend sends `POST /api/v2/ai/break-down` with `{ todoId: "..." }`
3. Backend fetches the parent task, sends its title + description to Claude
4. Claude returns an array of subtask objects:
   ```json
   {
     "subtasks": [
       { "title": "Watch KodeKloud intro video", "priority": "medium" },
       { "title": "Set up local minikube cluster", "priority": "medium" },
       { "title": "Deploy a sample nginx pod", "priority": "low" }
     ]
   }
   ```
5. Backend creates each as a child task (using `parentId`) via Prisma
6. Returns the created subtasks to the frontend

**API:**

[ ]`POST /api/v2/ai/break-down` — accepts `{ todoId: string }`, returns created subtask array

**Frontend:**

[ ]"Break it down" button (or sparkle/wand icon) on task cards and task detail view
[ ]Loading state while AI processes
[ ]Show generated subtasks in an expandable list under the parent
[ ]User can delete any generated subtask they don't want

**Prompt engineering notes:**

[ ]Instruct Claude to generate 3-6 subtasks (not more)
[ ]Each subtask should be a concrete, single-session action (not another vague goal)
[ ]Include the parent task's tags so subtasks can inherit relevant tags

**Dependencies:** Subtasks (1.2) must be implemented first.

---

### [ ] 2.3 Auto-Tagging

**Description:**
When a task is created, the AI automatically suggests tags based on the task content and the user's existing tag set.

**Why it's needed:**

- Users rarely tag manually, which makes filtering useless
- Tags become valuable when they're consistently applied
- Low-effort feature that runs in the background

**How it works:**

1. User creates a task (via normal form or NLP parsing)
2. After task creation, a background job (BullMQ) sends the task title + description + existing tag list to Claude
3. Claude returns 0-3 matching tag names from the user's existing tags
4. Backend attaches the tags to the task via `TodoTag` join table
5. Frontend shows the tags on the task card (user can remove any)

**API:**

- No new user-facing endpoint — this runs as a background job after `POST /api/v2/todo`
- The task is created immediately; tags are applied asynchronously

**BullMQ job:**

[ ]Queue: `ai-auto-tag`
[ ]Job data: `{ todoId, userId }`
[ ]Worker fetches the task + user's tag list, calls Claude, writes `TodoTag` records

**Frontend:**

[ ]Tags appear on task card after a short delay (React Query will pick up the change on next refetch or via invalidation)
[ ]Optional: show a subtle "AI-tagged" indicator so users know which tags were auto-applied
[ ]User toggle in preferences: enable/disable auto-tagging

**Prompt engineering notes:**

[ ]Only suggest from existing tags — do not invent new ones (to avoid tag sprawl)
[ ]If no tags match, return an empty array
[ ]Use a fast, cheap model (Haiku) since this is a background operation

**Dependencies:** None — uses existing tag system.

---

## Phase 3: AI-Powered Insights

These features use AI to analyze patterns in task data and deliver actionable insights. They run on schedules via BullMQ.

---

### [ ] 3.1 Daily Briefing

**Description:**
A morning summary of the user's day: what's overdue, what's due today, and what's coming up — delivered as an in-app notification or email.

**Why it's needed:**

- Gives users a reason to open the app every morning
- Leverages the existing notification infrastructure (BullMQ + Resend)
- AI adds value by prioritizing and summarizing rather than just listing

**How it works:**

1. A scheduled BullMQ job runs daily at the user's preferred digest time (from `UserPreference.digestTime`)
2. Worker fetches: overdue tasks, today's tasks, tomorrow's tasks
3. Sends the data to Claude with a prompt to generate a concise briefing
4. Claude returns a natural-language summary:
   ```
   You have 3 tasks today. "Submit tax forms" is high priority and due at 5pm.
   You also have 2 overdue tasks from this week — "Review PR #42" and "Reply to Sarah."
   Tomorrow looks light with just 1 task scheduled.
   ```
5. Delivered via the existing notification system (email via Resend, and/or in-app)

**Data model changes:**

```
UserPreference additions:
  - dailyBriefingEnabled    Boolean   @default(false)
  - briefingTime            String?   // e.g., "08:00" in user's local timezone
```

**BullMQ:**

[ ]Scheduled repeatable job per user
[ ]Queue: `ai-daily-briefing`
[ ]Respects user's timezone and preferred briefing time

**Email template:**

[ ]New React Email template: `DailyBriefing.tsx`
[ ]Clean, scannable format with task counts, priority highlights, and overdue warnings

**Dependencies:** Completed tasks view (1.4) — so the briefing can reference yesterday's completions.

---

### [ ] 3.2 Weekly Review Agent

**Description:**
An automated weekly analysis that reviews the user's task completion patterns and generates insights — delivered every Sunday evening or Monday morning.

**Why it's needed:**

- Turns raw task data into self-awareness: "You completed 80% of your tasks this week, but finance-tagged tasks are consistently pushed back"
- Encourages consistent app usage
- Demonstrates a genuinely agentic workflow: the system autonomously reads data, reasons about it, and produces output on a schedule

**How it works:**

1. A scheduled BullMQ job runs weekly
2. Worker fetches the past 7 days of data:
   - Tasks created, completed, and still incomplete
   - Completion rates by tag/priority
   - Tasks that were rescheduled (due date changed)
   - Average time between task creation and completion
3. Sends the structured data to Claude with a prompt to analyze patterns
4. Claude returns a summary with insights:
   ```
   This week: 12/15 tasks completed (80%).
   Your #study tasks had the lowest completion rate (1/4).
   You rescheduled 3 tasks — all were low priority, suggesting
   you might be overcommitting on non-essential items.
   Top productivity day: Wednesday (5 tasks completed).
   ```
5. Delivered via email and/or in-app notification

**Data model changes:**

```
UserPreference additions:
  - weeklyReviewEnabled     Boolean   @default(false)
  - weeklyReviewDay         Int?      // 0=Sunday, 1=Monday, etc.
```

**BullMQ:**

[ ]Scheduled repeatable job per user
[ ]Queue: `ai-weekly-review`

**Email template:**

[ ]New React Email template: `WeeklyReview.tsx`
[ ]Sections: Summary Stats, Insights, Suggestions for Next Week

**Dependencies:**

- Completed tasks view (1.4) — needs completion history
- Tags (already exists) — for per-category analysis

---

## Phase 4: Real-Time Infrastructure

These features add WebSocket-based real-time communication, completing the notification pipeline and enabling live updates across devices. They lay the groundwork for multi-user collaboration.

**Shared infrastructure for all Phase 4 features:**

[ ]Install `socket.io` and `@socket.io/redis-adapter` in the backend
[ ]Install `socket.io-client` in the frontend
[ ]Create `/backend/src/services/socket/` module with Socket.io server setup and event constants

---

### [ ] 4.1 WebSocket Infrastructure + Real-Time Notifications

**Description:**
Establish the WebSocket layer using Socket.io and complete the in-app notification pipeline. The BullMQ `inAppWorker` currently exists as an empty stub — this feature fills it in so notifications are pushed to the frontend in real-time.

**Why it's needed:**

- The notification pipeline is half-built: `NotificationService` creates records, `QueueService` enqueues via BullMQ, but the `inAppWorker` has no way to deliver to the client
- Foundation for all subsequent real-time features (todo sync, collaboration)
- Redis is already available (sessions + BullMQ), so the Socket.io Redis adapter comes at near-zero infrastructure cost

**Backend changes:**

[ ]Create `backend/src/services/socket/index.ts` — Socket.io server with Redis adapter, session-based auth middleware, room management
[ ]Create `backend/src/services/socket/events.ts` — centralized event name constants
[ ]Modify `backend/src/index.ts` — extract `http.createServer(app)`, extract session middleware to named variable, initialize Socket.io, change `app.listen()` to `server.listen()`
[ ]Modify `backend/src/services/notification/processors/Worker.ts` — fill in `inAppWorker` to emit `notification:new` events via Socket.io to `user:{userId}` rooms

**Frontend changes:**

[ ]Create `frontend/src/services/socket.ts` — Socket.io client singleton with `withCredentials: true`, manual connect/disconnect
[ ]Create `frontend/src/hooks/use-socket.ts` — generic `useSocketEvent(event, handler)` hook
[ ]Create `frontend/src/hooks/use-realtime-notifications.ts` — listens for `notification:new`, shows toast via sonner, invalidates React Query caches
[ ]Modify `frontend/src/context/AuthContext.tsx` — call `connectSocket()` on auth success, `disconnectSocket()` on logout
[ ]Mount `useRealtimeNotifications()` in the authenticated app layout

**Architecture decisions:**

- Socket.io with `@socket.io/redis-adapter` for horizontal scaling
- Cookie-based WebSocket auth: reuse existing `express-session` middleware in Socket.io handshake
- Room-based: each user auto-joins `user:{userId}` on connection
- Conservative cache strategy: invalidate React Query keys on events (refetch from server) rather than patching cache from WebSocket payloads

**Dependencies:** None.

---

### [ ] 4.2 Real-Time Todo Sync

**Description:**
Broadcast todo mutations (create, update, delete) over WebSocket so all connected tabs and devices see changes instantly without waiting for React Query's stale time.

**Why it's needed:**

- Users with multiple tabs or devices see stale data for up to 60 seconds
- AI background features (auto-tagging, task breakdown) apply changes that should appear immediately
- Natural extension of the WebSocket infrastructure from 4.1

**Backend changes:**

[ ]Add Socket.io emit calls in todo route handlers (`POST`, `PATCH`, `DELETE` in `/backend/src/routes/v2/todo/`) to broadcast `todo:created`, `todo:updated`, `todo:deleted` events to `user:{userId}`
[ ]Include the full todo payload in events for optional optimistic cache updates

**Frontend changes:**

[ ]Create `frontend/src/hooks/use-realtime-todos.ts` — listens for todo events, invalidates relevant React Query keys
[ ]Add reconnection handler: invalidate all caches on `socket.on("connect")` to catch up after going offline
[ ]Optional: use `queryClient.setQueryData` for optimistic updates instead of refetching

**Dependencies:** 4.1 (WebSocket infrastructure).

---

### [ ] 4.3 Collaboration Infrastructure

**Description:**
Multi-user real-time collaboration with shared todo lists, team workspaces, live presence, and permission management.

**Why it's needed:**

- Transforms the app from a personal tool into a team productivity platform
- Shared lists with real-time sync are a table-stakes feature for collaborative todo apps
- Presence indicators (who's viewing, who's typing) make collaboration feel alive

**Data model changes:**

[ ]New `Team` model with membership and roles (owner, member)
[ ]New `SharedList` model linking teams to todo lists
[ ]Permission system: owner, editor, viewer roles per list
[ ]Add `listId` to `Todo` model for list-scoped tasks

**Backend changes:**

[ ]New route group: `/api/v2/team/` — create team, invite members, manage roles
[ ]New route group: `/api/v2/list/` — create/share lists, manage permissions
[ ]Socket.io `list:{listId}` rooms — join on list open, leave on navigate away
[ ]Broadcast todo mutations to list rooms (all collaborators see changes)
[ ]Presence tracking: `presence:join` / `presence:leave` events, track connected users with Redis sets per list

**Frontend changes:**

[ ]Team/list management UI
[ ]Presence indicators (avatars of who's viewing a list)
[ ]Real-time cursor/typing indicators (optional, WebRTC data channels for low-latency)
[ ]Permission-aware UI (disable editing for viewers)

**Dependencies:** 4.1 (WebSocket infrastructure), 4.2 (todo sync).

---

## Summary

| #   | Feature                   | Phase | Depends On | Status |
| --- | ------------------------- | ----- | ---------- | ------ |
| 1.1 | Finish Upcoming View      | 1     | —          | [X]    |
| 1.2 | Subtasks                  | 1     | —          | [X]    |
| 1.3 | Search                    | 1     | —          | [ ]    |
| 1.4 | Completed Tasks View      | 1     | —          | [ ]    |
| 1.5 | Recurring Tasks           | 1     | —          | [ ]    |
| 2.1 | NLP Task Creation         | 2     | —          | [ ]    |
| 2.2 | AI Task Breakdown         | 2     | 1.2        | [ ]    |
| 2.3 | Auto-Tagging              | 2     | —          | [ ]    |
| 3.1 | Daily Briefing            | 3     | 1.4        | [ ]    |
| 3.2 | Weekly Review Agent       | 3     | 1.4        | [ ]    |
| 4.1 | WebSocket + Notifications | 4     | —          | [ ]    |
| 4.2 | Real-Time Todo Sync       | 4     | 4.1        | [ ]    |
| 4.3 | Collaboration             | 4     | 4.1, 4.2   | [ ]    |
