import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import rateLimitter from "./middleware/rateLimiter.js";
import transactionsRoute from "./routes/transactions.route.js";
import job from "./config/cron.js";

dotenv.config();

console.log("Environment Variables:", process.env.PORT);

const PORT = process.env.PORT || 5001;

const app = express();

if (process.env.NODE_ENV !== "production") {
  job.start();
}

app.use(express.json());
app.use(rateLimitter);

async function connectToDatabase() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at  DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
    console.log("Database connected and table created successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

app.get("/health", async (req, res) => {
  res.send("Welcome to the Transactions API");
});

app.use("/api/transactions", transactionsRoute);

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
