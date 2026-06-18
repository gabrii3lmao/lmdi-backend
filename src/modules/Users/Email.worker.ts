import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { EmailService } from "./Email.service.js";
import { connection } from "./Email.queue.js";

const emailService = new EmailService();

export const emailWorker = new Worker(
  "email-queue",
  async (job: Job) => {
    if (job.name === "sendPasswordResetEmail") {
      const { to, token } = job.data;
      await emailService.sendPasswordResetEmail(to, token);
    }
  },
  { connection: connection as any },
);

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job!.id} failed with error:`, err);
});
