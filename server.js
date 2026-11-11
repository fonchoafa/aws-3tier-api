require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool (reads settings from environment variables)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // RDS PostgreSQL requires SSL by default. rejectUnauthorized:false is fine
  // for a lab; in production, load the AWS RDS CA bundle and set it to true.
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 5000,
});

app.use(express.json());

const router = express.Router();

// Health check for the ALB target group.
// Deliberately does NOT touch the database, so a database problem
// does not make the load balancer mark every server unhealthy.
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Database connection test
router.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS server_time, current_database() AS database"
    );
    res.status(200).json({
      status: "connected",
      database: result.rows[0].database,
      server_time: result.rows[0].server_time,
    });
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Simple root route
router.get("/", (req, res) => {
  res.json({
    message: "Ecommerce API is running",
    instance: process.env.HOSTNAME || "unknown",
  });
});

// Serve the same routes at "/" and "/api".
// CloudFront forwards /api/* to the ALB without stripping the prefix.
app.use("/", router);
app.use("/api", router);

// Listen on all interfaces so the load balancer can reach the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on port ${PORT}`);
});
