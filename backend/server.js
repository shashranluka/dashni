import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import pg from "pg";
import authRoute from "./routes/auth.route.js";

const app = express();
dotenv.config();

const { Pool } = pg;

// PostgreSQL connection
export const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'dashni_db',
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

// Test database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL!'))
  .catch(err => console.error('PostgreSQL connection error:', err));

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);

// Error handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}!`);
});
