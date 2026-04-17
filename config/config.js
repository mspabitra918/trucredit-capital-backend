require('dotenv').config();

const base = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'business_loan',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
};

module.exports = {
  development: base,
  test: base,
  production: {
    ...base,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  },
};
