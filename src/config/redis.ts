import "dotenv/config";
import { Redis } from "ioredis";

export const connection = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null },
);

connection.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});
connection.on("connect", () => {
  console.log("[Redis] Connected");
});
