import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import Stripe from "stripe";
import connectDb from "./src/Database/index.js";
import { Sendmail } from "./src/controllers/sendmail.js";
import userRouter from "./src/routes/user.routes.js";
import GuideRouter from "./src/routes/LocalGuide.routes.js";
import TripsRouter from "./src/routes/TripPackage.routes.js";
import { createLogger } from "./src/utils/logger.js";

dotenv.config({ path: ".env" });

const app = express();
const serverLogger = createLogger("server");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4001",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as Postman or server-to-server calls.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    serverLogger.warn("Blocked by CORS", { origin });
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/public/temp", express.static("public/temp"));
app.use("/uploads", express.static("uploads"));

// Lightweight request logging keeps backend debugging easy without adding a new dependency.
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    serverLogger.info("Request completed", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/Guide", GuideRouter);
app.use("/api/v1/Trips", TripsRouter);

app.post("/sendmail", Sendmail);

app.post("/create-payment-intent", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "A valid payment amount is required.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    serverLogger.error("Payment intent creation failed", { error: error.message });
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

const port = Number(process.env.PORT) || 8000;

connectDb().then(() => {
  const server = app.listen(port, () => {
    serverLogger.info("Server is running", { port });
  });

  server.on("error", (error) => {
    serverLogger.error("Server failed to start", {
      port,
      error: error.message,
    });
    process.exit(1);
  });
});
