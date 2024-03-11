const MysqlQuery = require("../query/mysql.query");

class Post{

    static getLikeData(data, next){
        let State = 'SELECT  O.ID , Q.is_liked IS NOT NULL as is_liked FROM (SELECT ID FROM Post WHERE Thread_ID = '+data.thread_id+' ORDER BY ID ASC LIMIT ' +process.env.POST_PER_PAGE+ ' OFFSET '+(data.page - 1)*Number(process.env.POST_PER_PAGE)+ ') as O LEFT JOIN (SELECT Post_ID, true as is_liked FROM Liked WHERE Member_ID = '+data.user_id+') as Q ON Q.Post_ID=O.ID; '
        MysqlQuery.select(State, next);
    }

    static getData(data, next){
        let sat = "SELECT * FROM Post WHERE Thread_ID = "+data.thread_id+" ORDER BY ID ASC LIMIT " +process.env.POST_PER_PAGE+ " OFFSET "+(data.page - 1)*Number(process.env.POST_PER_PAGE);
        let State = "SELECT O.rank_ as 'index', O.ID , O.Member_ID, O.RePost_ID, V.total_like, O.time, J.name, J.medium , J.quote , J.user_name, L.role FROM ("+sat+") as O LEFT JOIN (SELECT Member.ID, MemberRole.name as role FROM Member LEFT JOIN MemberRole ON Member.MemberRole_ID = MemberRole.ID) as L ON L.ID = O.Member_ID LEFT JOIN MemberProfile as J ON J.Member_ID = O.Member_ID LEFT JOIN (SELECT COUNT(Post_ID) as total_like, Post_ID FROM Liked GROUP BY Post_ID) as V ON V.Post_ID=O.ID; " +
                    "SELECT COUNT(ID) as total_rows FROM Post WHERE Thread_ID = "+data.thread_id+" ;"+
                    "SELECT Thread.SubForum_ID, Thread.ID, Thread.title AS title_thread, K.ID as tagID, K.title AS title_tag, K.code, K.ID as TagThread_ID, SubForum.title as SubForumName, Category.title as CategoryName, Category.ID as Category_ID FROM Thread LEFT JOIN (SELECT TagThread.ID, TagThread.title, ColorPanel.code  FROM TagThread LEFT JOIN ColorPanel ON TagThread.ColorPanel_ID=ColorPanel.ID) as K ON K.ID=Thread.TagThread_ID  LEFT JOIN SubForum ON SubForum.ID=Thread.SubForum_ID LEFT JOIN Category ON Category.ID=SubForum.Category_ID  WHERE Thread.ID = "+data.thread_id+";";
                    MysqlQuery.select(State, next);
    }

    static getIndexPost(data, next){
        let State = 'SELECT N.total as "index", N.Thread_ID FROM  (SELECT Thread_ID FROM Post WHERE ID = '+data.post_id+') as M LEFT JOIN (SELECT Thread_ID, COUNT(ID) as total FROM Post WHERE ID <= '+data.post_id+' GROUP BY Thread_ID) as N  ON M.Thread_ID=N.Thread_ID;';
        MysqlQuery.select(State, next);
    }

    static getTotalByThread(thread_id, next){
        let State = "SELECT COUNT(Thread_ID) AS total FROM Post WHERE Thread_ID = "+thread_id+" GROUP BY Thread_ID;";
        MysqlQuery.select(State, next);
    }

    static addView(thread_id, next){
        let State;
        State = 'UPDATE Thread SET total_view = total_view + 1 WHERE ID='+thread_id+';';
        MysqlQuery.select(State, next);
    }

    static create(data, next){
        let State = "";
        if(data.reply_id === 0){
            State = "SET @ID_CURRENT_POST = 0;  SET @MEMBER_ID = 0; SET @IS_BLOCK = 0;"+
            "CALL CREATE_POST("+data.thread_id+","+data.user_id+", @ID_CURRENT_POST, @MEMBER_ID, @IS_BLOCK );  "+
            "SELECT @ID_CURRENT_POST AS 'post_id' ; "+
            "SELECT @MEMBER_ID AS 'member_id' ;  "+
            "SELECT @IS_BLOCK AS 'is_block' ; ";
        }else{
            State = "SET @ID_CURRENT_POST = 0;  SET @MEMBER_ID = 0; SET @IS_BLOCK = 0;"+
            "CALL CREATE_RE_POST("+data.thread_id+","+data.user_id+","+ data.reply_id +", @ID_CURRENT_POST, @MEMBER_ID, @IS_BLOCK );  "+
            "SELECT @ID_CURRENT_POST AS 'post_id' ; "+
            "SELECT @MEMBER_ID AS 'member_id' ;  "+
            "SELECT @IS_BLOCK AS 'is_block' ; ";
        }
        MysqlQuery.insert(State, next);
    }

    static delete(data, next){
        let State = "";
        if(data.role === 1){
            State = 'DELETE FROM `Post` WHERE (`ID` = '+data.post_id+') and ( `RePost_ID` <> `ID` or `RePost_ID` is NULL );'
        }else{
            State = 'DELETE FROM `Post` WHERE (`ID` = '+data.post_id+') and ( `Member_ID` = '+data.user_id+' ) and ( `RePost_ID` <> `ID` or `RePost_ID` is NULL );'
        }
        MysqlQuery.delete(State, next);
    }

    

    static deleteLike_Time(data, next){
        let State = "";
        State = 'DELETE FROM `Liked` WHERE (`Member_ID` = '+data.member_id+') and ( '+data.time+' ) ;';
        MysqlQuery.delete(State, next);
    }
    static deletePost_Time(data, next){
        let State = "";
        State = 'DELETE FROM `Post` WHERE (`Member_ID` = '+data.member_id+') and ( '+data.time+' ) ;';
        MysqlQuery.delete(State, next);
    }
    


    static setLike(data, next){
        let State;
        if(data.isliked == 1){
            State = "SET @MEMBER_ID = 0; SET @IS_BLOCK = 0;"+
            "CALL CREATE_LIKE("+data.post_id+","+data.user_id+", @MEMBER_ID, @IS_BLOCK );  "+
            "SELECT @MEMBER_ID AS 'member_id' ;  "+
            "SELECT @IS_BLOCK AS 'is_block' ; ";
        }else
            State = 'DELETE FROM Liked WHERE Post_ID='+data.post_id+' AND Member_ID='+data.user_id+';';
        MysqlQuery.select(State, next);
    }

    static getListManagePost(data, next){
        let State = "";
        if(Number(data.cur_post_id) == -1)
        State = State +  "SELECT O.rank_ as 'index', O.ID , O.Member_ID, O.RePost_ID, V.total_like, false as 'is_liked' , O.time, J.name, J.medium , J.quote , J.user_name, L.role, O.Thread_ID, H.title as ThreadName, (Z.Member_ID IS NOT NULL) AS isBan " +
                         "FROM (SELECT * FROM Post ORDER BY ID DESC LIMIT 5) as O  ";
        else 
        State = State + "SELECT O.rank_ as 'index', O.ID , O.Member_ID, O.RePost_ID, V.total_like, false as 'is_liked' , O.time, J.name, J.medium , J.quote , J.user_name, L.role, O.Thread_ID, H.title as ThreadName, (Z.Member_ID IS NOT NULL) AS isBan " +
                        "FROM (SELECT * FROM Post WHERE ID <= "+data.cur_post_id+" ORDER BY ID DESC LIMIT 5) as O  ";
        
        State = State + "LEFT JOIN (SELECT Member.ID, MemberRole.name as role FROM Member LEFT JOIN MemberRole ON Member.MemberRole_ID = MemberRole.ID) as L  ON L.ID = O.Member_ID  LEFT JOIN MemberProfile as J ON J.Member_ID = O.Member_ID LEFT JOIN Banned as Z ON Z.Member_ID=O.Member_ID  LEFT JOIN (SELECT COUNT(Post_ID) as total_like, Post_ID FROM Liked GROUP BY Post_ID) as V ON V.Post_ID=O.ID LEFT JOIN Thread as H ON H.ID=O.Thread_ID;"
        MysqlQuery.select(State, next);
    }

    static getFeedByTime(user_id, id_posts, time, limit, next){        
        let State = "SET @USER_ID = "+user_id+" ; ";
            State = State + "SELECT O.ID, O.rank_ as 'index' , O.Member_ID, O.RePost_ID, V.total_like, Z.Post_ID IS NOT NULL as 'is_liked' , O.time, J.name, J.medium , J.quote , J.user_name, L.role, O.Thread_ID, H.title as ThreadName  FROM (  (SELECT  A.ID, A.Member_ID, A.Thread_ID, A.time, A.RePost_ID, A.rank_  FROM Post AS A  RIGHT JOIN (SELECT Member_ID FROM Follower WHERE Followed=@USER_ID) as B ON A.Member_ID=B.Member_ID) UNION (SELECT  A.ID, A.Member_ID, A.Thread_ID , A.time , A.RePost_ID, A.rank_  FROM Post AS A  RIGHT JOIN (SELECT K.ID AS Thread_ID FROM (SELECT * FROM SavedSubForum WHERE Member_ID=@USER_ID) AS Q LEFT JOIN Thread AS K ON Q.SubForum_ID=K.SubForum_ID) AS C ON C.Thread_ID=A.Thread_ID) UNION (SELECT  A.ID, A.Member_ID, A.Thread_ID , A.time, A.RePost_ID, A.rank_   FROM Post AS A  RIGHT JOIN (SELECT K.ID AS Thread_ID FROM (SELECT * FROM SubForum WHERE Owner_ID=@USER_ID) AS Q LEFT JOIN Thread AS K ON Q.ID=K.SubForum_ID) AS D  ON D.Thread_ID=A.Thread_ID) ) AS O LEFT JOIN (SELECT Member.ID, MemberRole.name as role FROM Member  LEFT JOIN MemberRole ON Member.MemberRole_ID = MemberRole.ID) as L  ON L.ID = O.Member_ID   LEFT JOIN MemberProfile as J ON J.Member_ID = O.Member_ID  LEFT JOIN (SELECT COUNT(Post_ID) as total_like, Post_ID FROM Liked GROUP BY Post_ID) as V ON V.Post_ID=O.ID  LEFT JOIN Thread as H ON H.ID=O.Thread_ID   LEFT JOIN Liked as Z ON Z.Post_ID = O.ID  WHERE ( O.time >= ' "+time+" ' )  AND  ( O.ID NOT IN ("+id_posts.join(',')+") )  ORDER BY O.ID DESC LIMIT "+limit+"  ;"
        MysqlQuery.select(State, next);
    }
}

module.exports = Post;


        // if(data.thread_id == -1){
        //     let State = 'DELETE FROM `Post` WHERE (`ID` = '+data.post_id+') and (`Member_ID` = '+data.user_id+') and ( `RePost_ID` <> `ID` or `RePost_ID` is NULL );'
        //     MysqlQuery.delete(State, next);
        // }
        // else{
            // let State = 'DELETE FROM `Post` WHERE (`ID` = '+data.post_id+') and (`Thread_ID` = '+data.thread_id+') and (`Member_ID` = '+data.user_id+')  and ( `RePost_ID` <> `ID` or `RePost_ID` is NULL );'
            // MysqlQuery.delete(State, next);
        // }