import { Queue } from "bullmq";

const connectionOptions = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  maxRetriesPerRequest: null,
};

console.log("--conection options in queuessservice", connectionOptions);

class QueueService {
  queues = new Map<string, Queue>();
  channels = ["email", "sms", "push", "inApp"];

  constructor() {
    this.initializeQueues();
  }

  private initializeQueues() {
    this.channels.map((channel) => {
      const queue = new Queue(`notification-${channel}`, {
        connection: connectionOptions,
      });
      this.queues.set(channel, queue);
    });
  }

  async addToQueue(channel: string, data: any, delayMs: number = 0) {
    const queue = this.queues.get(channel);
    if (!queue) {
      throw new Error(`Queue for channel ${channel} not found`);
    }
    const id = `${channel}-${data.notificationId}`;
    await queue.add(`send-${channel.toLowerCase()}`, data, {
      attempts: 3,
      delay: Math.max(delayMs, 0),
      jobId: id,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
  }

  async deleteJob(channel: string, id: number) {
    const queue = this.queues.get(channel);
    if (!queue) {
      throw new Error(`Queue for channel ${channel} not found`);
    }
    const jobId = `${channel}-${id}`;
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}

export default QueueService;
