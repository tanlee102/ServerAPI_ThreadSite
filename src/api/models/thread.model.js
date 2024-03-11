const MysqlQuery = require("../query/mysql.query")

class Thread{
    constructor() {}

    static count = process.env.THREAD_PER_PAGE;

    static create(data, next) {
        let State = "SET @ID_CURRENT_THREAD = 0; SET @ID_CURRENT_POST = 0;  SET @MEMBER_ID = 0; SET @IS_BLOCK = 0;"+
                    "CALL CREATE_THREAD( ?, ?, ?, ?, ?, @ID_CURRENT_THREAD, @ID_CURRENT_POST, @MEMBER_ID, @IS_BLOCK );  "+
                    "SELECT @ID_CURRENT_THREAD AS 'thread_id' ; "+
                    "SELECT @ID_CURRENT_POST AS 'post_id' ; "+
                    "SELECT @MEMBER_ID AS 'member_id' ;  "+
                    "SELECT @IS_BLOCK AS 'is_block' ; "+
                    "SELECT Followed FROM Follower WHERE Member_ID= ? ORDER BY rand() LIMIT 4; ";
        MysqlQuery.insert_(State, 
            [data.title, data.image, data.tagthread_id, data.subforum_id, data.user_id, data.user_id] 
            ,next)
    }

    static getHead(data, next){
        let State = "SELECT M.title, M.introduce, M.Category_ID, V.title as CategoryName,  IFNULL(N.time, 0) as time_save, M.Owner_ID, K.name, K.user_name   FROM (SELECT * FROM SubForum WHERE ID = "+data.subforum_id+") AS M LEFT JOIN (SELECT SubForum_ID, time FROM SavedSubForum WHERE SubForum_ID = "+data.subforum_id+" AND Member_ID = "+data.user_id+") AS N ON M.ID = N.SubForum_ID LEFT JOIN MemberProfile AS K ON M.Owner_ID = K.Member_ID LEFT JOIN Category as V ON V.ID = M.Category_ID;";
        MysqlQuery.select(State, next);
    }

    static getOther(data, next){
        
        let count = Thread.count;

        let page = 0; if(data.page) page = Number(data.page)*count;
        let thread_id = -1; if(data.thread_id) thread_id = Number(data.thread_id);

        let type = 0;
        if(String(data.sorting_setting) === 'recent_activity') type = 1;
        if(String(data.sorting_setting) === 'total_post') type = 2;

        let State = "";

        if(type === 0){
            let setState = "SELECT M.Thread_ID, M.SubForum_ID, M.title, M.total_view, M.priority, N.ID as Post_ID, N.time, P.total_post, O.latest_time_post, N.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code  FROM (SELECT ID as Thread_ID, SubForum_ID, TagThread_ID, title, total_view, priority FROM Thread) as M LEFT JOIN (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as N ON M.Thread_ID=N.Thread_ID LEFT JOIN (SELECT COUNT(Thread_ID) AS total_post, Thread_ID FROM Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT MAX(time) as latest_time_post, Thread_ID From Post GROUP BY Thread_ID) AS O ON O.Thread_ID=M.Thread_ID LEFT JOIN MemberProfile as K ON K.Member_ID=N.Member_ID LEFT JOIN TagThread as Z ON Z.ID=M.TagThread_ID LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID  "
            if(thread_id === -1){
                State = State + setState + "WHERE M.priority = 0 AND M.SubForum_ID = "+data.subforum_id+" ORDER BY M.Thread_ID DESC LIMIT "+count+";"
                State = State + setState + "WHERE M.priority > 0 AND M.SubForum_ID = "+data.subforum_id+" ORDER BY M.priority DESC ;"
            }else{
                State = State + setState + "WHERE M.priority = 0 AND M.SubForum_ID = "+data.subforum_id+" AND  M.Thread_ID < "+thread_id+" ORDER BY M.Thread_ID DESC LIMIT "+count+";"
            }
        }

        if(type === 1) State = State + "SELECT M.latest_time_post, M.Thread_ID, N.SubForum_ID, N.title, N.total_view, N.priority, Y.time, Y.Post_ID, P.total_post, Y.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code  FROM (SELECT MAX(time) as latest_time_post, Thread_ID From Post AS V INNER JOIN (SELECT ID FROM Thread WHERE SubForum_ID="+data.subforum_id+") as L ON L.ID=V.Thread_ID GROUP BY V.Thread_ID ORDER BY latest_time_post DESC LIMIT 30) AS M LEFT JOIN Thread as N ON M.Thread_ID=N.ID LEFT JOIN (SELECT COUNT(Thread_ID) AS total_post, Thread_ID FROM Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT Thread_ID,Member_ID,time, ID as Post_ID FROM Post WHERE ID=RePost_ID) as Y ON M.Thread_ID=Y.Thread_ID LEFT JOIN MemberProfile as K ON K.Member_ID=Y.Member_ID LEFT JOIN TagThread as Z ON Z.ID=N.TagThread_ID LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID ORDER BY M.latest_time_post DESC;";
        
        if(type === 2) State = State + "SELECT M.total_post, M.Thread_ID, N.SubForum_ID, N.title, N.total_view, N.priority, Y.time, Y.Post_ID, P.latest_time_post, Y.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code FROM (SELECT COUNT(Thread_ID) as total_post, Thread_ID From Post AS V INNER JOIN (SELECT ID FROM Thread WHERE SubForum_ID="+data.subforum_id+") as L ON L.ID=V.Thread_ID GROUP BY V.Thread_ID ORDER BY total_post DESC LIMIT "+count+" OFFSET "+page+") AS M LEFT JOIN Thread as N ON M.Thread_ID=N.ID LEFT JOIN (SELECT MAX(time) as latest_time_post, Thread_ID From Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT Thread_ID, Member_ID, time, ID as Post_ID FROM Post WHERE ID=RePost_ID) as Y ON M.Thread_ID=Y.Thread_ID LEFT JOIN MemberProfile as K ON K.Member_ID=Y.Member_ID LEFT JOIN TagThread as Z ON Z.ID=N.TagThread_ID LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID ORDER BY M.total_post DESC;";

        MysqlQuery.select(State, next);
    }

    static getSuggest(data, next){
        let lowPriorityIds = ['13'];
        if(data?.low_hash)
        if(data.low_hash?.length > 0){
            lowPriorityIds = data.low_hash.split(",");
            lowPriorityIds = lowPriorityIds.map(function(entry) {
                return entry.replace(/[^0-9]/g, "");
            });
        }
        let State = `SELECT M.latest_time_post, M.Thread_ID, N.SubForum_ID, N.title, N.total_view, N.priority, Y.time, Y.Post_ID, P.total_post, Y.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code  FROM (SELECT MAX(time) as latest_time_post, Thread_ID From Post AS V INNER JOIN (SELECT ID FROM Thread WHERE SubForum_ID=`+data.subforum_id+`) as L ON L.ID=V.Thread_ID GROUP BY V.Thread_ID ORDER BY latest_time_post DESC) AS M LEFT JOIN Thread as N ON M.Thread_ID=N.ID LEFT JOIN (SELECT COUNT(Thread_ID) AS total_post, Thread_ID FROM Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT Thread_ID,Member_ID,time, ID as Post_ID FROM Post WHERE ID=RePost_ID) as Y ON M.Thread_ID=Y.Thread_ID LEFT JOIN MemberProfile as K ON K.Member_ID=Y.Member_ID LEFT JOIN TagThread as Z ON Z.ID=N.TagThread_ID LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID WHERE M.Thread_ID <> '`+data.thread_id+`' ORDER BY FIELD(M.Thread_ID, ${lowPriorityIds.join(',')}) ASC, M.latest_time_post DESC LIMIT 9;`;
        MysqlQuery.select_(State, lowPriorityIds, next);
    }

    static delete(data, next){
        let State = "";
        if(data.role === 1){
            State = "DELETE FROM Thread WHERE ID IN ( SELECT * FROM (SELECT Thread_ID AS ID FROM Post WHERE ( Thread_ID = "+data.thread_id+" ) and  ( RePost_ID = ID ) LIMIT 1) AS P );  ";
        }else{
            State = "DELETE FROM Thread WHERE ID IN ( SELECT * FROM (SELECT Thread_ID AS ID FROM Post WHERE ( Thread_ID = "+data.thread_id+" ) and  ( Member_ID = "+data.user_id+" ) and  ( RePost_ID = ID ) LIMIT 1) AS P );  ";
        }
        MysqlQuery.delete(State, next);
    }

    static deleteThread_Time(data, next){
        let State = "DELETE FROM Thread WHERE ID IN ( SELECT * FROM (SELECT Thread_ID AS ID FROM Post WHERE  ( Member_ID = "+data.member_id+" ) and  ( "+data.time+" ) and  ( RePost_ID = ID ) ) AS P );  ";
        MysqlQuery.delete(State, next);
    }

    static pin(data, next) {
        let State;
        if(data.priority === 0){
            State = "SET @PRIOR = ((SELECT IFNULL(MAX(priority), 0) FROM Thread WHERE SubForum_ID = ? ) + 1);  "+
                    "UPDATE Thread SET priority = @PRIOR WHERE ID = ? ; " + 
                    "SELECT Member_ID as member_id FROM Post WHERE Thread_ID = ? AND ID=RePost_ID; "
            MysqlQuery.insert_(State, [data.subforum_id, data.thread_id,  data.thread_id], next);
        }else{
            State = "UPDATE Thread SET priority = 0 WHERE ID = ? ; ";
            MysqlQuery.insert_(State, [data.thread_id], next);
        }
    }


    static latest(next){
        let State = "SELECT A.ID, A.title, A.TagThread_ID, B.title as TagName, L.code, P.time, K.Member_ID, K.name, K.user_name, K.thumbnail, M.ID as IDSubForum, M.title as SubForumName FROM Thread as A  LEFT JOIN TagThread as B ON A.TagThread_ID=B.ID LEFT JOIN ColorPanel as L ON L.ID=B.ColorPanel_ID LEFT JOIN (SELECT Thread_ID, Member_ID, time FROM Post WHERE ID=RePost_ID) as P ON P.Thread_ID=A.ID LEFT JOIN MemberProfile as K  ON K.Member_ID=P.Member_ID LEFT JOIN SubForum as M ON M.ID=A.SubForum_ID WHERE A.TagThread_ID <> 2  ORDER BY A.ID DESC LIMIT 9;  ";
        MysqlQuery.select(State, next);
    }

    static latestSuper(next){
        let State = "SELECT A.ID, A.title, A.image_url as image, A.TagThread_ID, B.title as TagName, L.code, P.time, K.Member_ID, K.name, K.user_name, K.thumbnail, M.ID as IDSubForum, M.title as SubForumName FROM Thread as A  LEFT JOIN TagThread as B ON A.TagThread_ID=B.ID LEFT JOIN ColorPanel as L ON L.ID=B.ColorPanel_ID LEFT JOIN (SELECT Thread_ID, Member_ID, time FROM Post WHERE ID=RePost_ID) as P ON P.Thread_ID=A.ID LEFT JOIN MemberProfile as K  ON K.Member_ID=P.Member_ID LEFT JOIN SubForum as M ON M.ID=A.SubForum_ID WHERE A.TagThread_ID = 2  ORDER BY A.ID DESC LIMIT 4;   ";
        MysqlQuery.select(State, next);
    }

    static listLatest(data,next){
        let count = Thread.count;

        let State = "SELECT M.Thread_ID, M.SubForum_ID, L.title as SubForumName, M.title, M.total_view, M.priority, N.ID as Post_ID, N.time, P.total_post, O.latest_time_post, N.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code  FROM (SELECT ID as Thread_ID, SubForum_ID, TagThread_ID, title, total_view, priority FROM Thread) as M LEFT JOIN (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as N ON M.Thread_ID=N.Thread_ID LEFT JOIN (SELECT COUNT(Thread_ID) AS total_post, Thread_ID FROM Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT MAX(time) as latest_time_post, Thread_ID From Post GROUP BY Thread_ID) AS O ON O.Thread_ID=M.Thread_ID LEFT JOIN SubForum as L ON L.ID=M.SubForum_ID LEFT JOIN MemberProfile as K ON K.Member_ID=N.Member_ID  LEFT JOIN TagThread as Z ON Z.ID=M.TagThread_ID LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID   ";
        
        if(Number(data.cur_thread_id) == -1) State = State + " ORDER BY M.Thread_ID DESC  LIMIT "+count+" ; ";
        else State = State + " WHERE M.Thread_ID < "+Number(data.cur_thread_id)+" ORDER BY M.Thread_ID DESC  LIMIT "+count+" ; ";
        
        MysqlQuery.select(State, next);
    }


    static listTop(data,next){
        let count = Thread.count;

        let State = "SELECT M.Thread_ID, M.SubForum_ID, L.title as SubForumName, M.title, M.total_view, M.priority, N.ID as Post_ID, N.time, P.total_post, O.latest_time_post, N.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code  FROM (SELECT ID as Thread_ID, SubForum_ID, TagThread_ID, title, total_view, priority FROM Thread) as M LEFT JOIN (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as N ON M.Thread_ID=N.Thread_ID LEFT JOIN (SELECT COUNT(Thread_ID) AS total_post, Thread_ID FROM Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT MAX(time) as latest_time_post, Thread_ID From Post GROUP BY Thread_ID) AS O ON O.Thread_ID=M.Thread_ID LEFT JOIN SubForum as L ON L.ID=M.SubForum_ID LEFT JOIN MemberProfile as K ON K.Member_ID=N.Member_ID  LEFT JOIN TagThread as Z ON Z.ID=M.TagThread_ID  LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID          ";
        State = State + " ORDER BY P.total_post DESC LIMIT "+count+"  OFFSET " + Number(data.page)*count + " ; ";

        MysqlQuery.select(State, next);
    }


    static listSearch(data, next){

        let count = Thread.count;

        let listSearch = String(data.search).split(' ');

        let ReSearch = "";
        let ArSearch = [];
        listSearch.forEach(element => {
            if(listSearch[listSearch.length-1] === element){
                ReSearch = ReSearch + " M.title LIKE ? ";
                ArSearch.push(`%${element}%`)
            }else{
                ReSearch = ReSearch + " M.title LIKE ? AND "
                ArSearch.push(`%${element}%`)
            }
        });

        let State = "SELECT M.Thread_ID, M.SubForum_ID, L.title as SubForumName, M.title, M.total_view, M.priority, N.ID as Post_ID, N.time, P.total_post, O.latest_time_post, N.Member_ID, K.name, K.user_name, K.thumbnail, Z.title as TagName, U.code  FROM (SELECT ID as Thread_ID, SubForum_ID, TagThread_ID, title, total_view, priority FROM Thread) as M LEFT JOIN (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as N ON M.Thread_ID=N.Thread_ID LEFT JOIN (SELECT COUNT(Thread_ID) AS total_post, Thread_ID FROM Post GROUP BY Thread_ID) as P ON P.Thread_ID=M.Thread_ID LEFT JOIN (SELECT MAX(time) as latest_time_post, Thread_ID From Post GROUP BY Thread_ID) AS O ON O.Thread_ID=M.Thread_ID LEFT JOIN SubForum as L ON L.ID=M.SubForum_ID LEFT JOIN MemberProfile as K ON K.Member_ID=N.Member_ID  LEFT JOIN TagThread as Z ON Z.ID=M.TagThread_ID  LEFT JOIN ColorPanel as U ON U.ID=Z.ColorPanel_ID          ";
        State = State + " WHERE "+ReSearch+" ORDER BY P.total_post DESC, N.time DESC LIMIT "+count+" OFFSET " + Number(data.page)*count + " ; ";

        MysqlQuery.select_(State, ArSearch, next);
    }

}

module.exports = Thread;