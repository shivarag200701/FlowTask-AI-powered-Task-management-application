import { Queue } from "bullmq";

const connectionOptions = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  maxRetriesPerRequest: null,
};

class AssistantQueueService {
  private queue: Queue;

  constructor() {
    // Keep Redis queue name as "accountability" to avoid orphaning existing jobs
    this.queue = new Queue("accountability", {
      connection: connectionOptions,
    });
    this.setupRepeatableJobs();
  }

  private async setupRepeatableJobs() {
    // Daily snapshot — runs at 2:00 AM UTC every day
    await this.queue.add(
      "daily-snapshot",
      {},
      {
        repeat: { pattern: "0 2 * * *" },
        jobId: "daily-snapshot-repeatable",
      }
    );

    // Daily standup trigger — runs every 15 minutes
    await this.queue.add(
      "daily-standup-trigger",
      {},
      {
        repeat: { pattern: "*/15 * * * *" },
        jobId: "daily-standup-trigger-repeatable",
      }
    );

    // Weekly insights — runs Mondays at 6:00 AM UTC
    await this.queue.add(
      "weekly-insights",
      {},
      {
        repeat: { pattern: "0 6 * * 1" },
        jobId: "weekly-insights-repeatable",
      }
    );

    console.log("Assistant repeatable jobs registered");
  }

  getQueue() {
    return this.queue;
  }
}

export default AssistantQueueService;
