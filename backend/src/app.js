const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const stateRoutes = require("./routes/stateRoutes");
const dayRoutes = require("./routes/dayRoutes");
const userRoutes = require("./routes/userRoutes");
const { requireAuth } = require("./middleware/requireAuth");

const app = express();

const normalizeOrigin = (origin = "") => origin.trim().replace(/\/+$/, "");

const rawOrigins = process.env.CLIENT_ORIGIN || "";
const allowList = rawOrigins
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests and keep local dev open if no allow-list is configured.
      if (!origin || !allowList.length) {
        callback(null, true);
        return;
      }

      if (allowList.includes(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", requireAuth, userRoutes);
app.use("/api/state", requireAuth, stateRoutes);
app.use("/api/days", requireAuth, dayRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
