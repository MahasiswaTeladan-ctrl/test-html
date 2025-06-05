// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12783074',
  password: 'SWKxypXDW3',     // sesuaikan
  database: 'sql12783074' // sesuaikan
});

module.exports = pool;
