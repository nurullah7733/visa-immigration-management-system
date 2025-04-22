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

          -- Basic Information
          first_name TEXT,
          middle_name TEXT,
          last_name TEXT,
          used_other_names BOOLEAN DEFAULT FALSE,

          -- Birth Information
          date_of_birth DATE,
          gender TEXT,
          country_of_birth TEXT,
          province_of_birth TEXT,
          country_of_citizenship TEXT,

          -- Immigration Status
          currently_in_us BOOLEAN DEFAULT FALSE,
          applied_for_us_visa BOOLEAN DEFAULT FALSE,

          -- Identification
          alien_registration_number TEXT,
          social_security_number TEXT,

          -- U.S. Entry Information
          been_to_us BOOLEAN DEFAULT FALSE,

          -- Passport Information
          passport_number TEXT,
          passport_issuing_country TEXT,
          passport_issued_date DATE,
          passport_expiry_date DATE,

          -- Contact Information
          has_us_address BOOLEAN DEFAULT FALSE,
          us_address TEXT,
          us_address_apt TEXT,
          us_unit_type TEXT,
          us_city TEXT,
          us_state TEXT,
          us_zip_code TEXT,

          foreign_address TEXT,
          foreign_apt TEXT,
          foreign_unit_type TEXT,
          foreign_city TEXT,
          foreign_state_province TEXT,
          foreign_postal_code TEXT,
          foreign_country TEXT,
          foreign_province TEXT,

          phone_number TEXT,
          email TEXT,

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

            user_id UUID REFERENCES users(id) ON DELETE CASCADE,

            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            linkedin_profile_url TEXT, -- optional
            job_ended BOOLEAN, -- optional

            -- Work Address
            work_city TEXT NOT NULL,
            work_state_province TEXT NOT NULL,
            work_country TEXT NOT NULL,

            base_salary NUMERIC, -- optional
            currency_salary TEXT, -- optional (e.g., USD, KWD)
            pay_period TEXT, -- optional (e.g., monthly, weekly, annually)
            hours_work_per_week INTEGER, -- optional

            receive_any_bonuses BOOLEAN, -- optional
            stock_option BOOLEAN, -- optional

            benefit_receive TEXT, -- optional
            compensation_not_mentioned_above TEXT, -- optional
            describe_job_responsibilities TEXT NOT NULL,

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

          user_id UUID REFERENCES users(id) ON DELETE CASCADE,

          company_name TEXT NOT NULL,
          legal_name TEXT NOT NULL,
          website TEXT NOT NULL,
          phone_number TEXT NOT NULL,

          gross_income NUMERIC NOT NULL,
          net_income NUMERIC NOT NULL,

          representative_name TEXT NOT NULL,
          representative_email TEXT NOT NULL,
          representative_phone TEXT NOT NULL,

          hq_address TEXT NOT NULL,

          company_headquarters_street_address TEXT,
          company_headquarters_address TEXT,
          company_headquarters_city TEXT, 
          company_headquarters_state TEXT,
          company_headquarters_zip_code TEXT,
          company_headquarters_country TEXT, 

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
