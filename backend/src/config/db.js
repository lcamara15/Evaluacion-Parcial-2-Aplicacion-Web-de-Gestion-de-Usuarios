const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "app_usuarios",
  password: "a123",
  port: 5432,
});

module.exports = pool;