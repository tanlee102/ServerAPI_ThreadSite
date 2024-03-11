const MysqlQuery = require("../query/mysql.query");

class Notification{
    static getNotification(data, next){
        let count = process.env.NOTIFICATION_PER_PAGE;
        let State = "SELECT A.ID, J.total_actor, F.latest_actor,  E.Member_ID, E.thumbnail, E.user_name, E.name as name_actor, A.readed, A.update_time, A.total_actor as total_actor_ , B.EntityID,  C.first_state, C.last_state, D.ID as ID_Table, D.name, D.dbtype, H.post_entityid, H.thread_entityid FROM (SELECT * FROM Notification WHERE NotifierID =  "+data.user_id+" ORDER BY update_time DESC) as A   JOIN NotificationObject as B ON B.ID = A.NotificationObject_ID  JOIN EntityType as C ON B.EntityType_ID = C.ID   JOIN TableEntityType as D ON D.ID = C.Table   JOIN (SELECT MAX(Actor) as latest_actor, keep_time, NotificationObject_ID FROM NotificationChange WHERE (NotifierID = "+data.user_id+" OR NotifierID IS NULL) GROUP BY keep_time, NotificationObject_ID ) as F ON F.NotificationObject_ID =  A.NotificationObject_ID AND A.keep_cur = F.keep_time  JOIN NotificationChange AS H ON H.Actor = F.latest_actor AND H.NotificationObject_ID = A.NotificationObject_ID AND H.keep_time = A.keep_cur AND (H.NotifierID = "+data.user_id+" OR H.NotifierID IS NULL) JOIN (SELECT COUNT(DISTINCT Actor) as total_actor, keep_time, NotificationObject_ID FROM NotificationChange WHERE (NotifierID = "+data.user_id+" OR NotifierID IS NULL) GROUP BY keep_time, NotificationObject_ID) as J ON J.NotificationObject_ID =  A.NotificationObject_ID AND A.keep_cur = J.keep_time  JOIN MemberProfile as E ON E.Member_ID = F.latest_actor  ORDER BY update_time DESC  LIMIT "+count+" OFFSET  "+Number(data.page)*count+";  "
        MysqlQuery.select(State, next);
    }

    static setAllReaded(data, next){
        let State = "UPDATE Notification SET readed = 1 WHERE NotifierID = "+data.user_id+";   "
        MysqlQuery.select(State, next);
    }

    static createNotification(data, next){
        let State = "SET @OUT_ID = 0; ";
        if(data.notifier_id !== data.actor_id){
            State = State + "CALL CREATE_NOTIFICATION("+data.entity_type_id+","+data.entity_id+","+data.notifier_id+","+data.actor_id+","+(data.post_entity_id ? data.post_entity_id : " NULL ")+","+(data.thread_entity_id ? data.thread_entity_id : " NULL ")+",'"+data.des_cription+"',@OUT_ID); "+
                            "SELECT @OUT_ID; ";
        }
        MysqlQuery.insert(State, next);
    }

    static createNotificationNotKeep(data, next){
        let State = "SET @OUT_ID = 0; ";
        if(data.notifier_id !== data.actor_id){
            State = State + "CALL CREATE_NOTIFICATION_NOT_KEEP("+data.entity_type_id+","+data.entity_id+","+data.notifier_id+","+data.actor_id+","+(data.post_entity_id ? data.post_entity_id : " NULL ")+","+(data.thread_entity_id ? data.thread_entity_id : " NULL ")+",'"+data.des_cription+"',@OUT_ID); "+
                            "SELECT @OUT_ID; ";
        }
        MysqlQuery.insert(State, next);
    }

    static createNotificationDistribute(data, next){
        let func = ""
        data.notifier_id.forEach(element => {
            if(element !== data.actor_id)
            func = func + " CALL CREATE_NOTIFICATION_DISTRIBUTE("+data.entity_type_id+","+data.entity_id+","+element+","+data.actor_id+","+(data.post_entity_id ? data.post_entity_id : " NULL ")+","+(data.thread_entity_id ? data.thread_entity_id : " NULL ")+",'"+data.des_cription+"',@OUT_ID);  ";
        });
        let State = "SET @OUT_ID = 0; " +
                    func +
                    "SELECT @OUT_ID; ";
        MysqlQuery.insert(State, next);
    }

    static removeEntityNotification(data, next){
        let State = "DELETE FROM NotificationObject WHERE EntityType_ID IN "+data.entity_type_id+" AND EntityID = "+data.entity_id+";"
        MysqlQuery.insert(State, next);
    }

    static deleteActorNotification(data, next){
        let State = "SELECT @Noti_Obj_exist := ID FROM NotificationObject WHERE EntityType_ID = "+data.entity_type_id+" AND EntityID = "+data.entity_id+" ;  " +
                    "DELETE FROM NotificationChange WHERE NotificationObject_ID = @Noti_Obj_exist AND Actor = "+data.actor_id+" ;";
        MysqlQuery.insert(State, next);      
    }

    static countNotification(data, next){
        let State = "SELECT COUNT(readed) as amount FROM Notification WHERE NotifierID="+data.member_id+" AND readed=0;"
        MysqlQuery.select(State, next);
    }

}

module.exports = Notification;

//let State = "SELECT A.ID, J.total_actor, F.latest_actor, E.avatar, E.name as name_actor, A.readed, A.update_time, A.total_actor as total_actor_ , B.EntityID,  C.first_state, C.last_state, D.ID as ID_Table, D.name, D.dbtype FROM (SELECT * FROM Notification WHERE NotifierID =  "+data.user_id+" ORDER BY update_time DESC) as A  JOIN NotificationObject as B ON B.ID = A.NotificationObject_ID JOIN EntityType as C ON B.EntityType_ID = C.ID  JOIN TableEntityType as D ON D.ID = C.Table  JOIN (SELECT MAX(Actor) as latest_actor, keep_time, NotificationObject_ID FROM NotificationChange GROUP BY keep_time, NotificationObject_ID) as F ON F.NotificationObject_ID =  A.NotificationObject_ID AND A.keep_cur = F.keep_time JOIN (SELECT COUNT(DISTINCT Actor) as total_actor, keep_time, NotificationObject_ID FROM NotificationChange GROUP BY keep_time, NotificationObject_ID) as J ON J.NotificationObject_ID =  A.NotificationObject_ID AND A.keep_cur = J.keep_time JOIN MemberProfile as E ON E.Member_ID = F.latest_actor  ORDER BY update_time DESC LIMIT 5 OFFSET  "+Number(data.page)*5+";  "
