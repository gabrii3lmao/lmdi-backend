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
    } else if (job.name === "sendVerificationEmail") {
      const { to, token } = job.data;
      await emailService.sendVerificationEmail(to, token);
    }
  },
  { connection: connection as any },
);

emailWorker.on("failed", (job, err) => {
  console.error(`[Email Worker] Job ${job!.id} failed:`, err);
});

emailWorker.on("error", (err) => {
  console.error("[Email Worker] Worker error:", err);
});
