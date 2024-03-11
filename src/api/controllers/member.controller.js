const Member = require('../models/member.model');
const M_Post = require('../schema/mongodb/post.schema');
const Notification = require('../models/notification.model');
const Post = require('../models/post.model');
const SubForum = require('../models/subforum.model');
const Thread = require('../models/thread.model');

const M_Msg = require('../schema/mongodb/msg.schema');
const M_ReMsg = require('../schema/mongodb/remsg.schema');

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(':')
    );
}

class member {

    static getListMember(req, res){
        Member.getListMember(req.query ,function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                let listID = [];
                result.forEach(element => {
                    listID.push(element.Member_ID);
                });
                Member.getFollowedByListMember(req.query.user_id, listID ,function(error_code, result_){
                    if(error_code == 0){
                        console.log(result_)
                        res.status(400).send('Status: Bad Request');
                    }else{
                        for(let i = 0; i < result.length; i++){
                            let element = result_.find(o => o.Member_ID === result[i].Member_ID);
                            if(element){
                                result[i].exfo = true;
                            }else{
                                result[i].exfo = false;
                            }
                        }
                        res.status(200).send(result);
                    }
                });
            }
        });
    }

    static getListSearchMember(req, res){
        Member.getListSearchMember(req.query ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getListManageMember(req, res){
        Member.getListManageMember(req.query,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }



    static getHeadInfoMember(req, res){
        Member.getHeadInfo(req.query , function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                result.push({member_id: req.query.member_id})
                res.status(200).send(result);
            }
        });
    }



    static setFollow(req, res){
        Member.setFollow( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request')
            }else{
                if(Number(result.affectedRows) == 1){

                    if(req.body.isfollowed == 1){

                        let data_not = {
                            entity_type_id: 12,
                            entity_id: req.body.member_id,
                            notifier_id: req.body.member_id,
                            actor_id: req.body.user_id,
                            des_cription: "follow user",
                            post_entity_id: 'NULL',
                        }
                        Notification.createNotification(data_not, function(error_code, result){
                            if(error_code == 0){
                                console.log(result)
                                res.status(400).send('Status: Bad Request')
                            }else{
                                res.status(201).send('Status: Created')
                            }
                        });                
    
                    }else{
    
                        Notification.deleteActorNotification({
                            entity_type_id: 12,
                            entity_id: req.body.member_id,
                            actor_id: req.body.user_id
                        }, function(error_code, result){
                            if(error_code == 0){
                                console.log(result)
                                res.status(400).send('Status: Bad Request')
                            }else{
                                res.status(201).send('Status: Created')
                            }
                        });
    
                    }

                }else{
                    res.status(400).send('Status: Bad Request')
                }

            }
        });
    }

    


    static getUserFollower(req, res){
        Member.getUserFollower(req.query , function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }


    static getUserFollowed(req, res){
        Member.getUserFollowed( req.query , function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }


    static getListPost(result,res){
        let listID = result;
        let IDx = [];
        listID.forEach(element => {
            IDx.push(element.ID);
        });

        M_Post.find({id_post: {$in: IDx}}).then(data => {

            for(let i = 0; i < result.length; i++){
                let element = data.find(o => o.id_post === result[i].ID);
                if(element){
                    result[i]['content'] = element.label_content ? element.label_content : element.label_content+"...";
                }
            }
            res.status(200).send(result);

        }).catch(err => {
            console.log(err);
            res.status(400).send('Status: Bad Request');
        })
    }

    static getMemberPostTimeLine(req, res){
        Member.getMemberPostTimeLine(req.query , function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                member.getListPost(result, res);
            }
        });
    }


    static getMemberPostLiked(req, res){
        Member.getMemberPostLiked( req.query , function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                member.getListPost(result, res);
            }
        });
    }




    static addListBanned(req, res, next){
        Member.insertListBanned(req.body, function (code ,result) {
            if(code){
                return next();
            }else{
                res.status(400).send(result);
            }
        })
    }   

    static removeListBanned(req, res, next){
        Member.deleteListBanned(req.body, function (code ,result) {
            if(code){
                return next();
            }else{
                res.status(400).send(result);
            }
        });
    }

    
    static addListBlocked(req, res){
        Member.insertListBlocked(req.body, function (code ,result) {
            if(code){
                res.status(201).send('Status: Created')
            }else{
                res.status(400).send(result);
            }
        })
    }   
    
    static removeListBlocked(req, res){
        Member.deleteListBlocked(req.body, function (code ,result) {
            if(code){
                res.status(201).send('Status: Created');
            }else{
                res.status(400).send(result);
            }
        })
    }

    static getUserBlocked(req, res){
        Member.getUserBlocked( req.query , function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }



    static deleteActivity(req, res){
 
        let d = new Date();
        let SQLtime = "";
        if(req.body.time == 0){
            SQLtime = " `time` >  NOW() - INTERVAL 3 HOUR ";
            d.setHours(d.getHours() - 3);
        }else if(req.body.time == 1){
            SQLtime = " `time` >  NOW() - INTERVAL 1 DAY ";
            d.setDate(d.getDate() - 1);
        }else if(req.body.time == 2){
            SQLtime = " true = true ";
            d.setDate(d.getDate() - 365);
        }

        req.body.time = SQLtime;
        Post.deleteLike_Time( req.body , function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{

                Thread.deleteThread_Time( req.body , function(error_code, result){
                    if(error_code == 0){
                        console.log(result)
                        res.status(400).send('Status: Bad Request');
                    }else{
        
                        Post.deletePost_Time( req.body , function(error_code, result){
                            if(error_code == 0){
                                console.log(result)
                                res.status(400).send('Status: Bad Request');
                            }else{
             
                                SubForum.deleteSubForum_Time( req.body , function(error_code, result){
                                    if(error_code == 0){
                                        console.log(result)
                                        res.status(400).send('Status: Bad Request');
                                    }else{
                            
                                        Member.deleteBlocked_Time( req.body , function(error_code, result){
                                            if(error_code == 0){
                                                console.log(result)
                                                res.status(400).send('Status: Bad Request');
                                            }else{

                                                Member.deleteFollow_Time( req.body , async function(error_code, result){
                                                    if(error_code == 0){
                                                        console.log(result)
                                                        res.status(400).send('Status: Bad Request');
                                                    }else{
                                                        result = await M_Msg.deleteMany({ Member_ID: req.body.member_id,  time: { $gt: formatDate(new Date(d)) } });
                                                        if(result.deletedCount >= 1){
                                                            console.log('delete MSG')
                                                        }
                                                        result = await M_ReMsg.deleteMany({ Member_ID: req.body.member_id,  time: { $gt: formatDate(new Date(d)) } });
                                                        if(result.deletedCount >= 1){
                                                            console.log('delete ReMSG')
                                                        }
                                                        res.status(201).send('Status: Created');
                                                    }
                                                });
                                            
                                            }
                                        });

                                    }
                                });

                            }
                        });

                    }
                });

            }
        });



    }

    
}

module.exports = member;