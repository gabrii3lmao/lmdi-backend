import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { connection as redisClient } from "../modules/Users/Email.queue.js";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 200, // Limite de 100 requisições por IP
  message: {
    error:
      "Muitas requisições feitas por este IP, por favor tente novamente mais tarde.",
  },
  store: new RedisStore({
   //@ts-ignore
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});
