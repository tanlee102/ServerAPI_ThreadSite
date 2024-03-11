const MysqlQuery = require("../query/mysql.query")

class Poll{
    constructor() {}

    static get(user_id, next) {

        let State = "SELECT user_name,name,Member_ID FROM MemberProfile WHERE member_id = "+user_id+" ;";  
        MysqlQuery.select(State, next);
        
    }
}


module.exports = Poll;