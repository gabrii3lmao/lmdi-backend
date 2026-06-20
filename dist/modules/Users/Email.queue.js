import "dotenv/config";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
export const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });
connection.on("error", () => { });
export const emaillQueue = new Queue("email-queue", {
    connection: connection,
});
//# sourceMappingURL=Email.queue.js.map