import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "messenger",
  password: process.env.DB_PASS || "your_password",
  port: Number(process.env.DB_PORT) || 5432,
});

pool.connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((err) => console.error("❌ DB connection error:", err.stack));

export default pool;