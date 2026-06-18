import express from "express";
import Router from "./routes/Router.js";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./config/workers.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import { globalLimiter } from "./middlewares/rateLimiterMiddleware.js";

const app = express();
app.set("trust proxy", true);
app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(globalLimiter);
app.use("/api", Router);
app.use(errorMiddleware);

async function bootstrap() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("Connected to MongoDB!");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

bootstrap();
