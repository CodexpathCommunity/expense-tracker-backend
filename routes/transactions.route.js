import express from "express";
import { sql } from "../config/db.js";
import e from "express";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.status(200).json(transactions);
  } catch (error) {
    console.log("error fetching transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/summary/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS balance
        FROM transactions
        WHERE user_id = ${userId}
      `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
        FROM transactions
        WHERE user_id = ${userId}
        AND amount > 0
      `;
    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expense
        FROM transactions
        WHERE user_id = ${userId}
        AND amount < 0
      `;

    res.status(200).json({
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expenseResult[0].expense,
    });
  } catch (error) {
    console.log("error getting the summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !amount || !category || !user_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transaction = await sql`
      INSERT INTO transactions (user_id, title, amount, category) 
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *
      `;
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.log("error creating transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }
  try {
    const result =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.log("error deleting transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
