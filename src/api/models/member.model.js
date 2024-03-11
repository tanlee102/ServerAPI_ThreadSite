const MysqlQuery = require("../query/mysql.query")

class User{
    constructor() {}

    static count = process.env.MEMBER_PER_PAGE;
    static default_count = process.env.DEFAULT_TOP_MEMBER;
    static post_count = process.env.POSTLINE_PER_PAGE;

    static getListMember(data,next){
        let State = "";
        if(data.sorting_setting === 'this_month')
            State = "SELECT A.Member_ID, A.total_post, B.total_like, C.name, C.user_name, C.thumbnail FROM (SELECT COUNT(ID) as total_post, Member_ID FROM Post WHERE time >  NOW() - INTERVAL 30 DAY GROUP BY Member_ID  ) as A LEFT JOIN (SELECT COUNT(P.Member_ID) as total_like, Member_ID FROM (SELECT G.Member_ID FROM Liked as P LEFT JOIN Post as G ON P.Post_ID=G.ID) as P GROUP BY P.Member_ID) as B ON B.Member_ID=A.Member_ID LEFT JOIN MemberProfile as C ON C.Member_ID=A.Member_ID ORDER BY A.total_post DESC LIMIT "+User.default_count+";";
        else if(data.sorting_setting === 'list_admin')
            State = "SELECT A.total_post, A.Member_ID, B.total_like, C.name, C.user_name, C.thumbnail, D.name as Role  FROM (SELECT * FROM Member WHERE MemberRole_ID>0) as M LEFT JOIN  (SELECT COUNT(ID) as total_post, Member_ID FROM Post GROUP BY Member_ID) as A ON M.ID=A.Member_ID  LEFT JOIN (SELECT COUNT(P.Member_ID) as total_like, Member_ID FROM (SELECT G.Member_ID FROM Liked as P LEFT JOIN Post as G ON P.Post_ID=G.ID) as P GROUP BY P.Member_ID) as B   ON B.Member_ID=A.Member_ID  LEFT JOIN MemberProfile as C ON C.Member_ID=A.Member_ID   LEFT JOIN MemberRole as D ON D.ID=M.MemberRole_ID  WHERE M.MemberRole_ID>0 ORDER BY M.MemberRole_ID ASC;  ";
        else
            State = "SELECT A.total_post, A.Member_ID, B.total_like, C.name, C.user_name, C.thumbnail FROM (SELECT COUNT(ID) as total_post, Member_ID FROM Post GROUP BY Member_ID) as A LEFT JOIN (SELECT COUNT(P.Member_ID) as total_like, Member_ID FROM (SELECT G.Member_ID FROM Liked as P LEFT JOIN Post as G ON P.Post_ID=G.ID) as P GROUP BY P.Member_ID) as B ON B.Member_ID=A.Member_ID LEFT JOIN MemberProfile as C ON C.Member_ID=A.Member_ID ORDER BY A.total_post DESC LIMIT "+User.default_count+";  ";
        
        MysqlQuery.select(State, next);
    }

    static getFollowedByListMember(user_id, listID, next){
        let State = "SELECT Member_ID FROM Follower WHERE Followed = "+user_id+" AND Member_ID IN ( "+listID.join(',')+" ); "
        MysqlQuery.select(State, next);
    }


    static getListSearchMember(data, next){

        let listSearch = String(data.search).split(' ');
        let ReSearch = "";
        let ArSearch = [];
        listSearch.forEach(element => {
            if(listSearch[listSearch.length-1] === element){
                ReSearch = ReSearch + " C.name LIKE ? ";
                ArSearch.push(`%${element}%`)
            }else{
                ReSearch = ReSearch + " C.name LIKE ? AND ";
                ArSearch.push(`%${element}%`)
            }
        });

        let State = "SELECT A.total_post, A.Member_ID, B.total_like, C.name, C.user_name, C.thumbnail FROM MemberProfile as C LEFT JOIN (SELECT COUNT(ID) as total_post, Member_ID FROM Post GROUP BY Member_ID) as A ON C.Member_ID=A.Member_ID  LEFT JOIN (SELECT COUNT(P.Member_ID) as total_like, Member_ID FROM (SELECT G.Member_ID FROM Liked as P LEFT JOIN Post as G ON P.Post_ID=G.ID) as P GROUP BY P.Member_ID) as B ON B.Member_ID=A.Member_ID         " 
        State = State + "WHERE "+ReSearch+" ORDER BY A.total_post DESC, A.Member_ID ASC LIMIT "+User.count+" OFFSET " + Number(data.page)*User.count + " ; ";

        MysqlQuery.select_(State, ArSearch, next);
    }

    
    static getHeadInfo(data, next){
        let State = "SELECT M.Member_ID, M.name, M.avatar, M.quote, M.date_join, IF(N.Followed IS NULL,0,1) AS followed, IF(K.total_like  IS NULL,0,K.total_like) AS total_like, IF(P.total_post IS NULL,0,P.total_post) AS total_post, IF(L.total_follower IS NULL,0,L.total_follower) AS total_follower, H.name as role, (Z.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock FROM (SELECT * FROM MemberProfile WHERE Member_ID = "+data.member_id+") AS M LEFT JOIN (SELECT * FROM Follower WHERE Member_ID = "+data.member_id+" AND Followed = "+data.user_id+") AS N ON M.Member_ID=N.Member_ID LEFT JOIN  (SELECT COUNT(Member_ID) as total_like, Member_ID FROM (SELECT Post_ID, Liked.Member_ID FROM (SELECT ID, Member_ID FROM Post WHERE Member_ID = "+data.member_id+") AS LP JOIN Liked ON LP.ID=Liked.Post_ID) AS Liked GROUP BY Member_ID) AS K ON K.Member_ID=M.Member_ID  LEFT JOIN (SELECT COUNT(Member_ID) as total_post, Member_ID FROM Post GROUP BY Member_ID HAVING Member_ID = "+data.member_id+") AS P ON P.Member_ID=M.Member_ID LEFT JOIN (SELECT COUNT(Member_ID) as total_follower, Member_ID FROM Follower GROUP BY Member_ID HAVING Member_ID = "+data.member_id+") AS L ON L.Member_ID=M.Member_ID LEFT JOIN Member as U ON U.ID=M.Member_ID LEFT JOIN MemberRole as H ON H.ID=U.MemberRole_ID LEFT JOIN Banned as Z ON Z.Member_ID=M.Member_ID LEFT JOIN (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+" AND Member_ID= "+data.member_id+") as W ON TRUE;         "
        State = State + " SELECT Blocker_ID IS NOT NULL FROM Blocked WHERE Blocker_ID="+data.member_id+" AND Member_ID="+data.user_id+" ;  ";
        State = State + " SELECT * FROM Privacy WHERE Member_ID = "+data.member_id+" ;"
        State = State + " SELECT Member_ID IS NOT NULL FROM Follower WHERE Member_ID = "+data.user_id+" AND Followed = "+data.member_id+" ;"
        MysqlQuery.select(State, next);
    }


    static setFollow(data, next){
        let State;
        if(data.isfollowed == 1){
            State = 'INSERT INTO Follower (Member_ID, Followed) VALUES ('+data.member_id+', '+data.user_id+');';
        }else
            State = 'DELETE FROM Follower WHERE Member_ID='+data.member_id+' AND Followed='+data.user_id+';';
        MysqlQuery.select(State, next);
    }



    static getUserFollower(data, next){
        let State = 'SELECT M.Followed as Member_ID, K.total_like, P.total_post , J.name, J.user_name, J.thumbnail, (Y.Member_ID IS NOT NULL) AS exfo FROM (SELECT * FROM Follower WHERE Member_ID='+data.member_id+' ORDER BY time ASC LIMIT '+User.count+' OFFSET '+Number(data.page)*User.count+') AS M LEFT JOIN (SELECT COUNT(Member_ID) as total_like, Member_ID FROM (SELECT Post.Member_ID FROM Liked LEFT JOIN Post ON Post.ID=Liked.Post_ID) AS Liked GROUP BY Member_ID) AS K ON K.Member_ID=M.Followed LEFT JOIN (SELECT COUNT(Member_ID) as total_post, Member_ID FROM Post GROUP BY Member_ID) AS P ON P.Member_ID=M.Followed LEFT JOIN (SELECT * FROM Follower WHERE Followed='+data.user_id+') AS Y ON Y.Member_ID=M.Followed LEFT JOIN MemberProfile as J ON J.Member_ID=M.Followed;        ';
        MysqlQuery.select(State, next);
    }

    static getUserFollowed(data, next){
        let State = 'SELECT M.Member_ID as Member_ID, K.total_like, P.total_post , J.name, J.user_name, J.thumbnail, (Y.Member_ID IS NOT NULL) AS exfo FROM (SELECT * FROM Follower WHERE Followed='+data.member_id+' ORDER BY time ASC LIMIT '+User.count+' OFFSET '+Number(data.page)*User.count+') AS M LEFT JOIN (SELECT COUNT(Member_ID) as total_like, Member_ID FROM (SELECT Post.Member_ID FROM Liked LEFT JOIN Post ON Post.ID=Liked.Post_ID) AS  Liked GROUP BY Member_ID) AS K ON K.Member_ID=M.Member_ID LEFT JOIN (SELECT COUNT(Member_ID) as total_post, Member_ID FROM Post GROUP BY Member_ID) AS P ON P.Member_ID=M.Member_ID LEFT JOIN (SELECT * FROM Follower WHERE Followed='+data.user_id+') AS Y ON Y.Member_ID=M.Member_ID LEFT JOIN MemberProfile as J ON J.Member_ID=M.Member_ID;        ';
        MysqlQuery.select(State, next);
    }

    static getMemberPostTimeLine(data, next){
        let State = "SELECT M.ID, M.rank_ as 'rank',M.time, N.SubForum_ID,  M.Thread_ID, N.TagThread_ID, N.title as ThreadName, P.title as SubForumName, B.title as TagName, L.code,  T.thumbnail FROM (SELECT * FROM Post WHERE Member_ID="+data.member_id+" ORDER BY ID DESC LIMIT "+User.post_count+" OFFSET "+Number(data.page)*User.post_count+") AS M LEFT JOIN Thread AS N ON N.ID=M.Thread_ID LEFT JOIN SubForum as P ON P.ID=N.SubForum_ID LEFT JOIN TagThread as B ON N.TagThread_ID=B.ID LEFT JOIN ColorPanel as L ON L.ID=B.ColorPanel_ID LEFT JOIN MemberProfile as T ON T.Member_ID=M.Member_ID;      ";
        MysqlQuery.select(State, next);
    }
    
    static getMemberPostLiked(data, next){
        let State = "SELECT M.ID, M.Member_ID, M.rank_ as 'rank',M.time, N.SubForum_ID,  M.Thread_ID, N.TagThread_ID, N.title as ThreadName, P.title as SubForumName, B.title as TagName, L.code, T.thumbnail FROM (SELECT Post_ID FROM Liked WHERE Member_ID="+data.member_id+" ORDER BY time DESC LIMIT "+User.post_count+" OFFSET "+Number(data.page)*User.post_count+") AS Q LEFT JOIN Post AS M ON M.ID=Q.Post_ID LEFT JOIN Thread AS N ON N.ID=M.Thread_ID LEFT JOIN SubForum as P ON P.ID=N.SubForum_ID LEFT JOIN TagThread as B ON N.TagThread_ID=B.ID LEFT JOIN ColorPanel as L ON L.ID=B.ColorPanel_ID LEFT JOIN MemberProfile as T ON T.Member_ID=M.Member_ID;        ";
        MysqlQuery.select(State, next);
    }


    static getMemberRole(member_id, next){
        let State = 'SELECT MemberRole_ID FROM Member WHERE ID = '+member_id+' LIMIT 1 ; ';
        MysqlQuery.select(State, next);
    }

    
    //manage -------------
    static getListManageMember(data,next){

        let listSearch = String(data.search).split(' ');
        let ReSearch = "";
        let ArSearch = [];
        listSearch.forEach(element => {
            if(listSearch[listSearch.length-1] === element){
                ReSearch = ReSearch + " N.name LIKE ? ";
                ArSearch.push(`%${element}%`)
            }else{
                ReSearch = ReSearch + " N.name LIKE ? AND ";
                ArSearch.push(`%${element}%`)
            }
        });

        let State = "";

        if(String(data.sorting_setting) === 'banned'){
            State = "SELECT M.ID, M.MemberRole_ID, N.name, N.user_name, N.thumbnail, N.date_join, M.email, (P.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock   FROM Banned as P LEFT JOIN Member as M ON M.ID=P.Member_ID LEFT JOIN MemberProfile as N ON M.ID=N.Member_ID LEFT JOIN (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+") as W ON W.Member_ID=M.ID "
        }else{
            State = "SELECT M.ID, M.MemberRole_ID, N.name, N.user_name, N.thumbnail, N.date_join, M.email, (P.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock   FROM Member as M LEFT JOIN MemberProfile as N ON M.ID=N.Member_ID LEFT JOIN Banned as P ON M.ID=P.Member_ID LEFT JOIN (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+") as W ON W.Member_ID=M.ID "
        }
        
        if(String(data.search).length > 0){
            State = State + " WHERE " + ReSearch;
        }

        if(String(data.sorting_setting) === 'banned'){
            State = State + " ORDER BY P.time DESC LIMIT "+User.count+" OFFSET "+Number(data.page)*User.count+";  ;"
        }else{
            State = State + "ORDER BY M.ID DESC LIMIT "+User.count+" OFFSET "+Number(data.page)*User.count+";  ;"
        }

        MysqlQuery.select_(State, ArSearch, next);        
    }


    
    static insertListBanned(data, next){
        let State = 'INSERT INTO Banned (Member_ID, reason) VALUES ('+data.member_id+', "admin ban") ;'
        MysqlQuery.insert(State, next)
    }

    static deleteListBanned(data, next){
        let State = 'DELETE FROM Banned WHERE Member_ID='+data.member_id+' ; '
        MysqlQuery.insert(State, next)
    }


    static insertListBlocked(data, next){
        let State = 'INSERT INTO Blocked (Blocker_ID, Member_ID) VALUES ('+data.user_id+', '+data.member_id+') ;'
        MysqlQuery.insert(State, next)
    }

    static deleteListBlocked(data, next){
        let State = 'DELETE FROM Blocked WHERE Blocker_ID = '+data.user_id+' AND Member_ID='+data.member_id+' ; '
        MysqlQuery.insert(State, next);
    }

    static getUserBlocked(data, next){
        let State = 'SELECT M.Member_ID as Member_ID, K.total_like, P.total_post , J.name, J.user_name, J.thumbnail, true AS exfo FROM (SELECT Member_ID FROM Blocked WHERE Blocker_ID='+data.user_id+' ORDER BY time ASC LIMIT '+User.count+' OFFSET '+User.count*data.page+') AS M LEFT JOIN (SELECT COUNT(Member_ID) as total_like, Member_ID FROM (SELECT Post.Member_ID FROM Liked LEFT JOIN Post ON Post.ID=Liked.Post_ID) AS Liked GROUP BY Member_ID) AS K ON K.Member_ID=M.Member_ID LEFT JOIN (SELECT COUNT(Member_ID) as total_post, Member_ID FROM Post GROUP BY Member_ID) AS P ON P.Member_ID=M.Member_ID LEFT JOIN MemberProfile as J ON J.Member_ID=M.Member_ID;        '
        MysqlQuery.select(State, next);
    }



    static deleteBlocked_Time(data, next){
        let State = "";
        State = 'DELETE FROM `Blocked` WHERE (`Blocker_ID` = '+data.member_id+') and ( '+data.time+' ) ;';
        MysqlQuery.delete(State, next);
    }

    static deleteFollow_Time(data, next){
        let State = "";
        State = 'DELETE FROM `Follower` WHERE (`Followed` = '+data.member_id+') and ( '+data.time+' ) ;';
        MysqlQuery.delete(State, next);
    }


}

module.exports = User;

        // let State = "";        

        // if(String(data.search).length > 0){

        //     if(String(data.sorting_setting) === 'banned')
        //         State = "SELECT M.ID, M.MemberRole_ID, N.name, N.user_name, N.thumbnail, N.date_join, N.email, (P.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock   FROM Banned as P LEFT JOIN Member as M ON M.ID=P.Member_ID  LEFT JOIN MemberProfile as N ON M.ID=N.Member_ID LEFT JOIN  (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+") as W ON W.Member_ID=M.ID    WHERE N.name LIKE '%"+String(data.search)+"%'  ORDER BY P.time DESC LIMIT "+User.count+" OFFSET "+Number(data.page)*User.count+";  ;"
        //     else 
        //         State = "SELECT M.ID, M.MemberRole_ID, N.name, N.user_name, N.thumbnail, N.date_join, N.email, (P.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock   FROM Member as M LEFT JOIN MemberProfile as N ON M.ID=N.Member_ID LEFT JOIN Banned as P ON M.ID=P.Member_ID  LEFT JOIN  (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+") as W ON W.Member_ID=M.ID  WHERE N.name LIKE '%"+String(data.search)+"%' ORDER BY M.ID DESC LIMIT "+User.count+" OFFSET "+Number(data.page)*User.count+";  ";

        // }else{
        //     if(String(data.sorting_setting) === 'banned')
        //         State = "SELECT M.ID, M.MemberRole_ID, N.name, N.user_name, N.thumbnail, N.date_join, N.email, (P.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock   FROM Banned as P LEFT JOIN Member as M ON M.ID=P.Member_ID  LEFT JOIN MemberProfile as N ON M.ID=N.Member_ID LEFT JOIN  (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+") as W ON W.Member_ID=M.ID   ORDER BY P.time DESC LIMIT "+User.count+" OFFSET "+Number(data.page)*User.count+";  ;"
        //     else 
        //         State = "SELECT M.ID, M.MemberRole_ID, N.name, N.user_name, N.thumbnail, N.date_join, N.email, (P.Member_ID IS NOT NULL) AS isBan, (W.Blocker_ID IS NOT NULL) AS isBlock   FROM Member as M LEFT JOIN MemberProfile as N ON M.ID=N.Member_ID LEFT JOIN Banned as P ON M.ID=P.Member_ID LEFT JOIN (SELECT * FROM Blocked WHERE Blocker_ID = "+data.user_id+") as W ON W.Member_ID=M.ID  ORDER BY M.ID DESC LIMIT "+User.count+" OFFSET "+Number(data.page)*User.count+";  ;"
        // }
  