import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

export async function ensureTablesExist() {
  const client = await pool.connect();

  try {
    // Check and create 'invites' table
    const invitesCheck = await client.query(`
      SELECT to_regclass('public.invites');
    `);
    if (!invitesCheck.rows[0].to_regclass) {
      await client.query(`
        CREATE TABLE invites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          token TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT now()
        );
      `);
      console.log("✅ 'invites' table created.");
    }

    // Check and create 'users' table
    const usersCheck = await client.query(`
      SELECT to_regclass('public.users');
    `);
    if (!usersCheck.rows[0].to_regclass) {
      await client.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          full_name TEXT,
          first_name TEXT,
          last_name TEXT,
          password TEXT,
          role TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT now()
        );
      `);
      console.log("✅ 'users' table created.");
    }
  } catch (err) {
    console.error("❌ Error checking/creating tables:", err);
  } finally {
    client.release();
  }
}
