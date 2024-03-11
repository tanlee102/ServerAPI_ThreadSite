const Notification = require('../models/notification.model');
const MysqlQuery = require("../query/mysql.query");


class notification {

    static getNotification(req, res){
        Notification.getNotification(req.query,function(error_code, result){

            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
            
                let listIDPost = [-1];
                let listIDThread = [-1];
                let listIDSubForum = [-1];

                for(let i = 0; i < result.length; i++){
                    if(result[i].name === 'Post'){
                        listIDPost.push(result[i].EntityID);
                    }
                }
                for(let i = 0; i < result.length; i++){
                    if(result[i].name === 'Thread'){
                        listIDThread.push(result[i].EntityID);
                    }
                }
                for(let i = 0; i < result.length; i++){
                    if(result[i].name === 'SubForum'){
                        listIDSubForum.push(result[i].EntityID);
                    }
                }

                let State = '';
                State = State + "SELECT M.Post_ID, M.Thread_ID, N.title FROM (SELECT ID as Post_ID,Thread_ID FROM Post WHERE ID IN ("+listIDPost.join(',')+")) AS M LEFT JOIN Thread as N ON M.Thread_ID = N.ID; ";
                State = State + "SELECT ID as Thread_ID, title FROM Thread WHERE ID IN ("+listIDThread.join(',')+"); "
                State = State + "SELECT ID as SubForum_ID, title FROM SubForum WHERE ID IN ("+listIDSubForum.join(',')+"); "
                
                MysqlQuery.select(State ,function(error_code, labelRe){

                    if(error_code == 0){
                        res.status(400).send('Status: Bad Request')
                    }else{

                        for(let i = 0; i < result.length; i++){

                            if(result[i].total_actor_) result[i].total_actor = Number(result[i].total_actor_);

                            if(result[i].name === 'Post'){
                                let element = labelRe[0].find(o => o.Post_ID === result[i].EntityID);
                                result[i].Thread_Title = element.title;
                                result[i].Thread_ID = element.Thread_ID;
                            }
                            if(result[i].name === 'Thread'){
                                let element = labelRe[1].find(o => o.Thread_ID === result[i].EntityID);
                                result[i].Thread_Title = element.title;
                                result[i].Thread_ID = element.Thread_ID;
                            }
                            if(result[i].name === 'SubForum'){
                                let element = labelRe[2].find(o => o.SubForum_ID === result[i].EntityID);
                                result[i].SubForum_Title = element.title;
                                result[i].SubForum_ID = element.SubForum_ID;
                            }
                        }

                        Notification.setAllReaded( req.query ,function(error_code, resultx){
                            if(error_code == 0){
                                res.status(400).send('Status: Bad Request')
                            }else{
                                res.status(200).send(result);
                            }
                        });
                    }
                });
            }
        });
    }

    static countNotification(req, res){
        Notification.countNotification(req.query ? req.query : req.body, function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

}

module.exports = notification;