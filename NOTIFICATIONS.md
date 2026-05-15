# Notification System — Technical Specification

## Overview

The notification system is a background job pipeline built on **BullMQ + Redis**. When a user creates a task with a reminder, a delayed job is placed into a queue for each of the user's enabled channels. At the scheduled time, a worker process picks up the job and delivers the notification. Email is the only channel with a complete delivery implementation today; SMS, push, and in-app are infrastructure stubs.

The system is gated behind an environment feature flag and is entirely decoupled from the main Express server — delivery runs in a separate worker process.

---

## Architecture

```
[POST /v1/todo] → NotificationService → QueueService → BullMQ Queues (Redis)
                                                              │
                                                    ┌─────────────────────┐
                                                    │  Worker Process      │
                                                    │  (Worker.ts)         │
                                                    ├────────────┬─────────┤
                                                    │ email      │ sms     │
                                                    │ (impl'd)   │ (stub)  │
                                                    ├────────────┼─────────┤
                                                    │ push       │ inApp   │
                                                    │ (stub)     │ (stub)  │
                                                    └────────────┴─────────┘
                                                              │
                                                    EmailService → Resend API
```

---

## Feature Flag

The entire system is controlled by a single environment variable:

```
FLAG_REMINDER_NOTIFICATION=true
```

Defined in `flags.ts`:

```ts
export const flags = {
  notificationService: process.env.FLAG_REMINDER_NOTIFICATION === "true",
};
```

When `false`, todo creation proceeds normally but no notification is created and no queue job is added. The flag must be explicitly set — it is `false` by default.

---

## Trigger Points

### On Task Create — `POST /v1/todo`

A notification is scheduled if and only if all three conditions are met:

1. The incoming payload has `reminder: true`
2. The payload has a `completeAt` date
3. `flags.notificationService` is `true`

```ts
if (
  reminder &&
  completeAt &&
  flags.notificationService &&
  notificationService
) {
  await notificationService.createNotification({
    userId,
    type: "task reminder",
    title: title,
    message: todo.description,
    todoId: todo.id,
    scheduledFor: completeAt, // ISO string of the due date
  });
}
```

The notification is scheduled **for the exact due time** (`completeAt`), not for `reminderBefore` minutes before it — see [Known Issues](#known-issues).

### On Task Delete — `DELETE /v1/todo/:id`

Before deleting a todo, all associated notification records are fetched and their BullMQ jobs are removed from the queues. This uses a **best-effort** pattern — if queue cleanup fails, the todo deletion still proceeds and the error is logged but not surfaced to the client.

```ts
// best-effort cleanup
try {
  await Promise.all(
    notifications.map(n => notificationService.deleteNotification(n))
  )
} catch (queueError) {
  console.error("Failed to remove jobs from queue, continuing with DB delete:", queueError)
}
await prisma.todo.delete(...)
```

### On Task Update — `PUT /v1/todo/:id`

**Not handled.** If a user changes the due date or toggles the reminder off, existing notification jobs in the queue are not updated or cancelled. This is a gap — see [Known Issues](#known-issues).

### On Task Complete — `POST /v1/todo/:id/completed`

**Not handled.** Completing a task does not cancel any pending notification jobs. If a task is completed before its due time, the reminder will still fire.

---

## Notification Pipeline (Step by Step)

### Step 1 — User preference lookup

`NotificationService.createNotification()` fetches `UserPrefrence` and the user's email from the database:

```ts
const preferences = await prisma.userPrefrence.findUnique({
  where: { userId },
});
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { email: true },
});
```

If no preferences record exists, the method returns early with no notification created.

### Step 2 — Channel selection

Enabled channels are collected from preferences:

```ts
const channels = [];
if (preferences.emailEnabled) channels.push("email");
if (preferences.smsEnabled) channels.push("sms");
if (preferences.pushEnabled) channels.push("push");
if (preferences.inAppEnabled) channels.push("inApp");
```

All four channels are enabled by default when a user is first created.

### Step 3 — Database record creation

A `Notifications` row is persisted **before** the queue jobs are added, for auditability and recovery:

```ts
const notification = await prisma.notifications.create({
  data: {
    userId,
    type,
    title,
    message,
    todoId,
    channels, // e.g. ["email", "inApp"]
    status: "SCHEDULED",
    schedulesFor: scheduledFor ?? null,
  },
});
```

The `notification.id` becomes the BullMQ job ID anchor for each channel.

### Step 4 — Job scheduling

One job is added to each channel's queue. Jobs are delayed by the difference between now and the scheduled time:

```ts
const delayMs = Math.max(0, new Date(scheduledFor).getTime() - Date.now());

await Promise.all(
  channels.map((channel) =>
    queueService.addToQueue(
      channel,
      {
        template: "notification",
        notificationId: notification.id,
        userId,
        type,
        message,
        todoId,
        title,
        scheduledFor,
        email: user.email,
      },
      delayMs
    )
  )
);
```

Each job is given a deterministic ID: `${channel}-${notificationId}` (e.g. `email-42`). This ID is what makes job deletion possible later.

### Step 5 — BullMQ queue configuration

Four queues are created at startup, one per channel:

| Queue name           | Channel |
| -------------------- | ------- |
| `notification-email` | `email` |
| `notification-sms`   | `sms`   |
| `notification-push`  | `push`  |
| `notification-inApp` | `inApp` |

Job options:

- **Attempts**: 3
- **Backoff**: Exponential, starting at 1000ms
- **Delay**: Computed from `scheduledFor`
- **Job ID**: `${channel}-${notificationId}`

### Step 6 — Worker processing

Workers run as a **separate Node.js process** (`Worker.ts`). Each worker listens on its respective queue:

```ts
const emailWorker = new Worker(
  "notification-email",
  async (job) => {
    await sendEmail(job.data);
  },
  { connection: connectionOptions }
);

const smsWorker = new Worker("notification-sms", async (job) => {
  /* stub */
});
const pushWorker = new Worker("notification-push", async (job) => {
  /* stub */
});
const inAppWorker = new Worker("notification-inApp", async (job) => {
  /* stub */
});
```

All workers have error listeners that log to console. On `SIGTERM`, all workers are gracefully closed.

### Step 7 — Email delivery

`sendEmail()` in `EmailService.ts` uses the **Resend** API with **React Email** for template rendering:

```ts
const resend = new Resend(process.env.RESEND_API_KEY);
```

For notification jobs, it renders `NotificationEmail.tsx` and sends with:

- **From**: `process.env.EMAIL` in production, `onboarding@resend.dev` in development
- **Subject**: `"Reminder from FlowTask about Task"`
- **HTML**: Rendered via `@react-email/render`

The email template includes the task title, a "Due Now" timestamp, and a **"Mark as Complete"** button that deep-links to `/dashboard?task=${todoId}`.

---

## Data Model

### `Notifications` table

| Field          | Type        | Description                        |
| -------------- | ----------- | ---------------------------------- |
| `id`           | `Int` PK    | Auto-increment                     |
| `userId`       | `Int` FK    | Owner; cascade deletes             |
| `todoId`       | `Int?` FK   | Related task; cascade deletes      |
| `type`         | `String`    | Always `"task reminder"` currently |
| `title`        | `String`    | Task title                         |
| `message`      | `String`    | Task description                   |
| `channels`     | `String[]`  | e.g. `["email", "inApp"]`          |
| `status`       | `String`    | `SCHEDULED` / `SENT` / `FAILED`    |
| `sentAt`       | `DateTime?` | Populated when delivered           |
| `readAt`       | `DateTime?` | Populated when read                |
| `schedulesFor` | `DateTime?` | Scheduled delivery time            |
| `metadata`     | `Json?`     | Reserved for future use            |

Indexes:

- `[userId, readAt]` — for fetching unread notifications per user
- `[status]` — for querying pending jobs

### `UserPrefrence` fields relevant to notifications

| Field                | Default    | Used                              |
| -------------------- | ---------- | --------------------------------- |
| `emailEnabled`       | `true`     | ✅ Channel selection              |
| `smsEnabled`         | `true`     | ✅ Channel selection (SMS stub)   |
| `pushEnabled`        | `true`     | ✅ Channel selection (Push stub)  |
| `inAppEnabled`       | `true`     | ✅ Channel selection (InApp stub) |
| `taskRemainders`     | `true`     | ❌ Not checked in code            |
| `automaticRemainder` | `true`     | ❌ Not checked in code            |
| `reminderBefore`     | `30` (min) | ❌ Not applied to schedule timing |
| `dailyDigest`        | `false`    | ❌ Not implemented                |
| `digestTime`         | `null`     | ❌ Not implemented                |
| `phoneNumber`        | `null`     | ❌ Not used (SMS stub)            |
| `pushToken`          | `null`     | ❌ Not used (Push stub)           |

---

## Email Template

`NotificationEmail.tsx` is built with React Email + Tailwind. It renders:

- FlowTask logo + wordmark
- "🔔 Reminder" label
- Task title as heading
- "Due Now" subtext
- Horizontal divider
- "Mark as Complete" button → `${FRONTEND_URL}/dashboard?task=${todoId}`

The app name used in both the notification email and OTP email is **FlowTask**.

---

## Known Issues

### 1. `reminderBefore` preference is not applied

The `UserPrefrence.reminderBefore` field (default 30 minutes) is fetched from the database but never used to offset `scheduledFor`. Notifications fire at the exact due time rather than 30 minutes before it as the schema implies.

**Fix**: In `NotificationService.createNotification()`, apply the offset before computing `delayMs`:

```ts
const reminderOffsetMs = (preferences.reminderBefore ?? 30) * 60 * 1000;
delayMs = Math.max(0, targetDate.getTime() - currentTime - reminderOffsetMs);
```

### 2. `delayMs` is uninitialized when `scheduledFor` is absent

`delayMs` is declared as `let delayMs: number` and only assigned inside an `if(scheduledFor)` block. If `scheduledFor` is falsy, `delayMs` is `undefined` when passed to `addToQueue`, causing `Math.max(undefined, 0)` → `NaN`. BullMQ's behavior with a `NaN` delay is undefined.

**Fix**: Give `delayMs` a default: `let delayMs: number = 0`.

### 3. Task updates do not reschedule notifications

`PUT /v1/todo/:id` does not cancel the old notification job or create a new one. If a user moves a task's due date from 3pm to 5pm, the reminder will still fire at 3pm.

### 4. Task completion does not cancel pending notifications

Marking a task complete before its due time does not remove the queued job. The user will still receive a "Due Now" reminder for a task they've already finished.

### 5. Schema field name typo

The Prisma schema defines the column as `schedulesFor` but conceptually it represents when the notification is _scheduled for_. The `NotificationService` uses the key `schedulesFor` consistently, but it does not match the more intuitive `scheduledFor` used everywhere else in the codebase.

### 6. SMS, Push, and In-App workers are empty stubs

The queue infrastructure for all four channels is complete, but only email has an actual delivery implementation. Jobs added to `notification-sms`, `notification-push`, and `notification-inApp` are consumed and discarded silently.

### 7. Notification status is never updated after delivery

Workers do not update the `Notifications.status` field to `SENT` or `FAILED` after processing. The database record stays in `SCHEDULED` indefinitely, making the `status` index and `sentAt`/`readAt` fields unused.

### 8. `taskRemainders` and `automaticRemainder` preferences are ignored

Both fields exist in the schema and are returned by the preferences API, but `NotificationService` does not check them before scheduling. A user who disables task reminders in settings will still receive them.

### 9. No notification lifecycle on the frontend

There is no notification center, bell icon, or in-app notification UI. The `readAt` index exists in the schema but nothing can mark a notification as read.

### 10. Email deep-link points to a deprecated route

The "Mark as Complete" button in `NotificationEmail.tsx` links to `/dashboard?task=${todoId}`. This route pattern does not match the current routing structure and will not correctly open the task.

---

## What's Working End-to-End

1. Creating a task with `reminder: true` and a future `completeAt`
2. User preferences are respected for channel selection
3. Notification record is persisted to the database
4. Email job is queued with the correct delay
5. Worker picks up the job at the scheduled time
6. React Email template is rendered and sent via Resend
7. Job IDs are deterministic, allowing cleanup on task deletion
8. Queue cleanup runs on task deletion (best-effort)
9. Exponential backoff retry on delivery failure (3 attempts)
10. Graceful worker shutdown on SIGTERM
