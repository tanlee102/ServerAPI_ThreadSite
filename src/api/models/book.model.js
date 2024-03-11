const mysql_con = require("../services/mysql.db");
console.log("start-model");

class Book{
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    static getall(next) {
        mysql_con.query("SELECT * FROM Book", function (err, result, fields) {
            if (err) throw err;
            next(result);
        });
    }
    
    static addall(book) {
        console.log(book);
    }

}


module.exports = Book;