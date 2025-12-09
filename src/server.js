import express from "express";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import memberRoutes from "./routes/memberRoutes.js";
import { metricsMiddleware, metricsEndpoint } from "./middleware/metrics.js";
import logger from "./logger/winston.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set("view engine", "ejs");
app.set("views", "views");
app.use(expressLayouts);
app.set("layout", "layout");

// Static files
app.use(express.static("public"));

// Metrics middleware
app.use(metricsMiddleware);

// Metrics endpoint
app.get("/metrics", metricsEndpoint);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Routes
app.get("/hello", (req, res) => {
  res.status(200).json({ message: "Hello DevOps!" });
});

app.use("/", memberRoutes);

// Start server only in production/development mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Running on port ${PORT}`);
  });
}

export default app;