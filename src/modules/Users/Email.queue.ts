import "dotenv/config";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

export const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null },
);

connection.on("error", (err) => {
  console.error("[Redis] Email queue connection error:", err);
});
connection.on("connect", () => {
  console.log("[Redis] Email queue connected");
});

export const emaillQueue = new Queue("email-queue", {
  connection: connection as any,
});
