import * as fs from 'fs';

// Decode and save certificate if SSL_CERT is provided
const sslConfig = process.env.SSL_CERT ? {
  ssl: {
    ca: Buffer.from(process.env.SSL_CERT, 'base64').toString(),
    rejectUnauthorized: process.env.NODE_ENV === 'production' // Only enforce in production
  }
} : {};

export default {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'db_admin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'lynkdb',
    port: parseInt(process.env.DB_PORT || '5433'),
    ...sslConfig
  },
  migrations: {
    directory: '../migrations'
  },
  seeds: {
    directory: './seeds'
  },
  debug: process.env.NODE_ENV !== 'production'
};
