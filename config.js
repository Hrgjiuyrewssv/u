require('dotenv').config();
const { Sequelize } = require("sequelize");
const fs = require("fs");

const DATABASE_URL = process.env.DATABASE_URL || "./database.db";

const toBool = (x) => x == 'true'
module.exports = {
  HANDLER: process.env.HANDLER  || 'null',
  MODE: (process.env.MODE || 'public').toLowerCase(),
  ERROR_MSG: toBool(process.env.ERROR_MSG) || true,
  LOG_MSG: toBool(process.env.LOG_MSG) || true,
  READ_CMD: toBool(process.env.READ_CMD),
  READ_MSG: toBool(process.env.READ_MSG),
  ANTI_DELETE: toBool(process.env.ANTI_DELETE) || true,
  SUDO: process.env.SUDO || '919539612761,917025673121',
  SESSION: process.env.SESSION || "bot--BYgcswHY",
  DATABASE:
    DATABASE_URL === "./database.db"
      ? new Sequelize({
          dialect: "sqlite",
          storage: DATABASE_URL,
          logging: false,
        })
      : new Sequelize(DATABASE_URL, {
          dialect: "postgres",
          ssl: true,
          protocol: "postgres",
          dialectOptions: {
            native: true,
            ssl: { require: true, rejectUnauthorized: false },
          },
          logging: false,
        }),
};
