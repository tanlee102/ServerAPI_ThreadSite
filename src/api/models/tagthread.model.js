// const mysql_con = require("../services/mysql.db");
const MysqlQuery = require("../query/mysql.query")

class TagThread{
    constructor() {}

    static getListColorPanel(next){
        let State = "SELECT ID as 'key', name FROM ColorPanel;"
        MysqlQuery.select(State, next);
    }

    static insert(data, next) {
        let State = "INSERT INTO TagThread (title, ColorPanel_ID) VALUES ('"+data.title+"', '"+data.colorpanel_id+"' );"
        MysqlQuery.insert(State, next)
    }

    static getall(next){
        let State = "SELECT TagThread.ID, TagThread.title, ColorPanel.name as color, ColorPanel.code FROM TagThread LEFT JOIN ColorPanel ON TagThread.ColorPanel_ID = ColorPanel.ID;"
        MysqlQuery.select(State, next);
    }


}


module.exports = TagThread;