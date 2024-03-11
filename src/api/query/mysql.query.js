const pool = require("../services/mysql.db");
console.log("start-model");

class MysqlQuery {
    static query(state, para, next) {
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Error getting connection from pool:', err);
          next(0, err);
          return;
        }
  
        connection.query(state, para, (error, results) => {
          connection.release(); // Release the connection back to the pool
  
          if (error) {
            console.error('Error executing query:', error);
            next(0, error);
          } else {
            next(1, results);
          }
        });
      });
    }
    
    static insert(state, next) {
        MysqlQuery.query(state, null, next);
    }
    
    static insert_(state, para, next) {
        MysqlQuery.query(state, para, next);
    }
    
    static select(state, next) {
        MysqlQuery.query(state, null, next);
    }
    
    static select_(state, para, next) {
        MysqlQuery.query(state, para, next);
    }
    
    static delete(state, next) {
        MysqlQuery.query(state, null, next);
    }
    
    static delete_(state, para, next) {
        MysqlQuery.query(state, para, next);
    }
}


module.exports = MysqlQuery;