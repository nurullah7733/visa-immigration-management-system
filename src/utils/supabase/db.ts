import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 5000,
  query_timeout: 5000,
});

export default pool;
