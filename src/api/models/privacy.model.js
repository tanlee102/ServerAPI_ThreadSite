const MysqlQuery = require("../query/mysql.query")

class Privacy{
    
    constructor() {};

    static get(user_id,next){
        let State = "SELECT * FROM Privacy WHERE Member_ID = "+user_id+" ;";
        MysqlQuery.select(State, next);
    }

    static update(data,next){
        let State = "UPDATE Privacy SET send_message = "+Number(data.send_message)+", post_liked = "+Number(data.post_liked)+", member_following = "+Number(data.member_following)+" WHERE (Member_ID = "+data.user_id+");";
        MysqlQuery.insert(State, next);
    }

    static check(data,next){
        let State = "SELECT * FROM Privacy WHERE Member_ID = "+data.member_id+" ;";
        State = State + " SELECT Member_ID IS NOT NULL FROM Follower WHERE Member_ID = "+data.user_id+" AND Followed = "+data.member_id+" ;"
        MysqlQuery.insert(State, next);
    }

}


module.exports = Privacy;