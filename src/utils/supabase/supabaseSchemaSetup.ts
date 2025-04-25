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

          case_owner_name TEXT,
          case_owner_user_id TEXT,
          case_owner_email TEXT,
          case_type TEXT,
          case_subtype TEXT,
          current_status TEXT,
          priority TEXT,
          filing_type TEXT,
          filing_deadline TIMESTAMP DEFAULT now(),
          estimated_completion_date TIMESTAMP DEFAULT now(),
          
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

    // Check and create 'personal_information' table
    const personalInformationCheck = await client.query(`
      SELECT to_regclass('public.personal_information');
    `);
    if (!personalInformationCheck.rows[0].to_regclass) {
      await client.query(`
        CREATE TABLE personal_information (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          meta jsonb, 
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `);
      console.log("✅ 'personal_information' table created.");
    }
    // Check and create 'employment_information' table
    const employmentInformationCheck = await client.query(`
      SELECT to_regclass('public.employment_information');
    `);
    if (!employmentInformationCheck.rows[0].to_regclass) {
      await client.query(`
        CREATE TABLE employment_information (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          meta jsonb, 
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `);
      console.log("✅ 'employment_information' table created.");
    }

    // Check and create 'employer_information' table
    const employerInformationCheck = await client.query(`
        SELECT to_regclass('public.employer_information');
      `);
    if (!employerInformationCheck.rows[0].to_regclass) {
      await client.query(`
          CREATE TABLE employer_information (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          meta jsonb, 
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
          );
        `);
      console.log("✅ 'employer_information' table created.");
    }

    // Check and create 'caseInfo' table
    const caseInfoCheck = await client.query(`
      SELECT to_regclass('public.case_info');
    `);
    if (!caseInfoCheck.rows[0].to_regclass) {
      await client.query(`
        CREATE TABLE case_info (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          
          case_owner_name TEXT,
          case_owner_user_id TEXT,
          case_owner_email TEXT,
          case_type TEXT,
          case_subtype TEXT,
          current_status TEXT,
          priority TEXT,
          filing_type TEXT,
          filing_deadline TIMESTAMP DEFAULT now(),
          estimated_completion_date TIMESTAMP DEFAULT now(),
          
          created_at TIMESTAMP DEFAULT now()
        );
      `);
      console.log("✅ 'case_info' table created.");
    }
  } catch (err) {
    console.error("❌ Error checking/creating tables:", err);
  } finally {
    client.release();
  }
}
