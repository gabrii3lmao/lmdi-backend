import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { connection as redisClient } from "../modules/Users/Email.queue.js";
let store;
try {
    store = new RedisStore({
        //@ts-ignore
        sendCommand: (...args) => redisClient.call(...args),
    });
}
catch {
    console.warn("Redis unavailable — using memory store for rate limiter");
}
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 200,
    message: {
        error: "Muitas requisições feitas por este IP, por favor tente novamente mais tarde.",
    },
    store,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});
//# sourceMappingURL=rateLimiterMiddleware.js.map