import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log('🔄 Running migrations...\n');

    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // Get already executed migrations
    const executed = await pool.query('SELECT name FROM _migrations');
    const executedNames = new Set(executed.rows.map((r) => r.name));

    // Run pending migrations
    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`⏭️  Skipping (already executed): ${file}`);
        continue;
      }

      console.log(`▶️  Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await pool.query('COMMIT');
        console.log(`✅ Completed: ${file}`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`❌ Failed: ${file}`);
        throw error;
      }
    }

    console.log('\n✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if called directly
runMigrations();
