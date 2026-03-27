import { Pool } from 'pg';
import { config } from '../config/config';

export const pool = new Pool({
  host:     config.db.host,
  port:     config.db.port,
  database: config.db.database,
  user:     config.db.user,
  password: config.db.password,
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          UUID         PRIMARY KEY,
      category    VARCHAR(20)  NOT NULL,
      severity    VARCHAR(10)  NOT NULL,
      title       VARCHAR(200) NOT NULL,
      message     TEXT         NOT NULL,
      resource_id VARCHAR(100),
      read        BOOLEAN      NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log('[DB] notifications table ready');
}