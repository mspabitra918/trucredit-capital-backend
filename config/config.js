require('dotenv').config();

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const local = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'business_loan',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
};

const prod = url
  ? {
      url,
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    }
  : local;

module.exports = {
  development: local,
  test: local,
  production: prod,
};
