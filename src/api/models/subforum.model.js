const MysqlQuery = require("../query/mysql.query")

class SubForum{
    
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }

    static count = process.env.SUBFORUM_PER_PAGE;

    static getTopByCategory(data,next){

        let State = 
        "SELECT * " + 
            "FROM (SELECT " +
                    "t.*, " +
                    "CASE " +
                        "WHEN @category != t.Category_ID THEN @rownum := 1 "+
                        "ELSE @rownum := @rownum + 1 " +
                    "END AS rankx, "+
                    "@category := t.Category_ID AS var_category "+ 
            "FROM "+
                    "(SELECT F.total_post,M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, H.total_thread "+
                    "FROM SubForum as M  "+
                    "LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID "+
                    "LEFT JOIN Thread as J ON J.ID = N.Thread_ID "+
                    "LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID "+
                    "LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O "+
                    "LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID "+
                    "LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID "+
                    "WHERE F.total_post IS NOT NULL  ORDER BY F.total_post DESC, H.total_thread DESC) "+
                    "as t "+
            "JOIN (SELECT @rownum := NULL, @category := '') r "+
            "ORDER BY t.Category_ID DESC "+
            ") x "+
        "WHERE x.rankx <= 6 ORDER BY x.Category_ID; ";

        MysqlQuery.select(State, next);
    }

    static getSavedByTop(listID, data, next){
        let State = "";
        State = State + "SELECT * FROM SavedSubForum WHERE Member_ID = ? AND SubForum_ID IN ( -1,"+listID.join(',')+" ) ; ";
        State = State + "SELECT M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID, TRUE as Is_save , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, F.total_post, H.total_thread  FROM SavedSubForum as P  LEFT JOIN SubForum as M ON M.ID = P.SubForum_ID  LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID  LEFT JOIN Thread as J ON J.ID = N.Thread_ID  LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID  LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID  LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID   "+
                        "WHERE P.Member_ID = ?  ORDER BY P.time DESC LIMIT 6; ";

        MysqlQuery.select_(State, 
            [data.user_id, data.user_id]
            , next);
    }


    static getByCategory(data, next){

        let count = SubForum.count;

        let subforum_id = -1; if(data.subforum_id) {subforum_id = Number(data.subforum_id)}
        let page = 0; if(data.page) page = Number(data.page)*count;
        let type = 0; if(String(data.sorting_setting) === 'chronological') type = 1;

        let State = "";
        if(data.category_id == 0){
            State = State + " SELECT M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID, (P.Member_ID IS NOT NULL) as Is_save , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, F.total_post, H.total_thread FROM (SELECT * FROM SavedSubForum WHERE Member_ID="+data.user_id+") as P   LEFT JOIN SubForum as M ON M.ID = P.SubForum_ID  LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID  LEFT JOIN Thread as J ON J.ID = N.Thread_ID  LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID  LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O  LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID  LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID  ORDER BY P.time DESC LIMIT "+count+" OFFSET "+page+";";
        }else
        if(type == 1){
            State = State + "SELECT M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID, (P.Member_ID IS NOT NULL) as Is_save , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, H.total_thread, F.total_post  FROM SubForum as M   LEFT JOIN (SELECT * FROM SavedSubForum WHERE Member_ID = "+data.user_id+") as P ON M.ID = P.SubForum_ID  LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID  LEFT JOIN Thread as J ON J.ID = N.Thread_ID  LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID  LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O  LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID  LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID             ";
            if(subforum_id == -1){
                State = State + " WHERE M.Category_ID= "+data.category_id+" ORDER BY M.ID DESC LIMIT "+count+";";
            }else{
                State = State + " WHERE M.Category_ID= "+data.category_id+" AND M.ID < "+subforum_id+" ORDER BY M.ID DESC LIMIT "+count+";";
            }
        }else{
            State = State + "SELECT F.total_post, M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID, (P.Member_ID IS NOT NULL) as Is_save , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, H.total_thread FROM SubForum as M  LEFT JOIN (SELECT * FROM SavedSubForum WHERE Member_ID = "+data.user_id+") as P ON M.ID = P.SubForum_ID  LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID  LEFT JOIN Thread as J ON J.ID = N.Thread_ID  LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID  LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O  LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID  LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID   WHERE M.Category_ID="+data.category_id+" ORDER BY F.total_post DESC, H.total_thread DESC LIMIT "+count+" OFFSET "+page+";";
        }

        State = State + "SELECT * FROM Category WHERE ID = "+data.category_id+" ;";

        MysqlQuery.select(State, next);
    }


    static getListSearchSubForum(data, next){
        let count = SubForum.count;
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

        let State = "SELECT F.total_post, M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID, (P.Member_ID IS NOT NULL) as Is_save , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, H.total_thread FROM SubForum as M  LEFT JOIN (SELECT * FROM SavedSubForum WHERE Member_ID = "+data.user_id+") as P ON M.ID = P.SubForum_ID  LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID  LEFT JOIN Thread as J ON J.ID = N.Thread_ID  LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID  LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O  LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID  LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID        " 
        State = State +  " WHERE "+ReSearch+" ORDER BY F.total_post DESC, M.ID ASC LIMIT "+count+" OFFSET "+Number(data.page)*count+";";

        MysqlQuery.select_(State, ArSearch, next);
    }


    static getByMember(data, next){

        let count = SubForum.count;

        let subforum_id = -1;
        if(data.subforum_id) subforum_id = Number(data.subforum_id);

        let State = "SELECT M.ID, M.Owner_ID, M.title, M.introduce, M.Category_ID, (P.Member_ID IS NOT NULL) as Is_save , N.Thread_ID, J.title as title_latest_thread, L.time as time_latest_thread, F.total_post, H.total_thread  FROM SubForum as M     LEFT JOIN (SELECT * FROM SavedSubForum WHERE Member_ID= "+data.user_id+") as P ON M.ID = P.SubForum_ID   LEFT JOIN (SELECT SubForum_ID , MAX(ID) AS Thread_ID FROM Thread GROUP BY SubForum_ID) as N ON M.ID=N.SubForum_ID   LEFT JOIN Thread as J ON J.ID = N.Thread_ID    LEFT JOIN  (SELECT Thread_ID, Member_ID ,time, ID FROM Post WHERE ID=RePost_ID) as L ON L.Thread_ID=N.Thread_ID   LEFT JOIN (SELECT SUM(K.total_post_per_thread) as total_post, K.SubForum_ID FROM (SELECT O.total_post_per_thread, O.Thread_ID, Thread.SubForum_ID FROM (SELECT COUNT(ID) as total_post_per_thread, Thread_ID FROM Post GROUP BY Thread_ID) AS O    LEFT JOIN Thread ON Thread.ID = O.Thread_ID) as K GROUP BY SubForum_ID) as F ON F.SubForum_ID=M.ID    LEFT JOIN (SELECT SubForum_ID, COUNT(ID) as total_thread FROM Thread GROUP BY SubForum_ID) as H ON H.SubForum_ID=M.ID   WHERE M.Owner_ID="+data.member_id+"     "; 

        if(subforum_id == -1){
            State = State + " ORDER BY M.ID DESC LIMIT "+count+";"
        }else{
            State = State + " AND M.ID < "+subforum_id+" ORDER BY M.ID DESC LIMIT "+count+";"
        }
        MysqlQuery.select(State, next);
    }


    static insert(data, next){
        let State = "INSERT INTO SubForum (title, Category_ID, introduce, Owner_ID) VALUES ( ? , ? , ? , ? ); SELECT LAST_INSERT_ID() as ID;"
        MysqlQuery.insert_(State, 
            [data.title, data.category_id, data.introduce, data.user_id]
            , next)
    }

    static update(data, next){
        let State = "UPDATE SubForum SET title = ? , introduce = ? WHERE ID = ? ; "
        MysqlQuery.insert_(State, 
            [data.title, data.introduce, data.subforum_id]
            , next)
    }

    static delete(data, next){
        let State = "";
        if(data.role === 1){
            State = "DELETE FROM SubForum WHERE ( ID = "+data.subforum_id+" );"
        }else{
            State = "DELETE FROM SubForum WHERE ( ID = "+data.subforum_id+" ) and ( Owner_ID = "+data.user_id+" );"
        }
        MysqlQuery.delete(State, next);
    }



    static deleteSubForum_Time(data, next){
        let State = "";
        State = 'DELETE FROM `SubForum` WHERE (`Owner_ID` = '+data.member_id+') and ( '+data.time+' ) ;';
        MysqlQuery.delete(State, next);
    }



    static save(data, next){
        let State;
        if(data.is_save) State = 'DELETE FROM SavedSubForum WHERE SubForum_ID= ? AND Member_ID= ? ;';
        else State = 'INSERT INTO SavedSubForum (SubForum_ID, Member_ID) VALUES ( ? , ? );';
        MysqlQuery.insert_(State,
            [data.subforum_id, data.member_id]
            , next);
    }
}

module.exports = SubForum;