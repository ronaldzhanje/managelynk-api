import knex from 'knex';
import { config } from 'dotenv';

config();

export const testDb = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'db_admin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'lynkdb',
    port: parseInt(process.env.DB_PORT || '5433'),
    pool: {
      min: 2,
      max: 20
    }
  }
});

export async function deleteTestUser(email: string) {
  await testDb('users')
    .where({ email })
    .delete();
}
