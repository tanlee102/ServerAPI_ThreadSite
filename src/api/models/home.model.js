const mysql_con = require("../services/mysql.db");
console.log("start-model");

class Home{
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }
}

Home.prototype.getall = function() {
    console.log(this.title);
    mysql_con.query("SELECT * FROM Book", function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

module.exports = Home;