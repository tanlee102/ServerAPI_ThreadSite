const mysql = require('mysql2');
const dbconfig = require('../../config/database.config');

const pool = mysql.createPool({
      host: dbconfig.mysql.host,
      port:dbconfig.mysql.port,
      user: dbconfig.mysql.user,
      password: dbconfig.mysql.password,
      database: dbconfig.mysql.db,
      multipleStatements: true,
      connectionLimit: 350,
  });

module.exports = pool;

console.log('Load Mysql File.');