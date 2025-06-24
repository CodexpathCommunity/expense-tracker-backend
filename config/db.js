import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

export const sql = neon(connectionString);
