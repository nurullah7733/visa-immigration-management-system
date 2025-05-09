import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,

  host: "db.czfqngofyvteucduxsmw.supabase.co",
  port: 5432,

  ssl: { rejectUnauthorized: false },
});

export default pool;
