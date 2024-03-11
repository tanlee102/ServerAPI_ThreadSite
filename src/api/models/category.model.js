const MysqlQuery = require("../query/mysql.query")

class Category{
    
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    static getall(next){
        let State = "SELECT ID as 'key', title as 'name' FROM Category ORDER BY ID ASC;"
        MysqlQuery.select(State, next);
    }

    static insert(title, next) {
        let State = "INSERT INTO Category (title) VALUES ( ? );"
        MysqlQuery.insert(State, 
            [ title ], next);
    }
}


module.exports = Category;