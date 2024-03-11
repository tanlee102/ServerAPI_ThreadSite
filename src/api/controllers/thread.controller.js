const Thread = require('../models/thread.model');
const M_Post = require('../schema/mongodb/post.schema');
const Notification = require('../models/notification.model');
const { delcache } = require('../middleware/cache.middleware');

class thread {

    static insert(req, res){

        Thread.create( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request')
            }else{

                if(Number(result[8][0].is_block) == 1){
                    res.status(400).send('Status: Bad Request')
                }else{

                    let distributeID = [];
                    result[9].forEach(element => {
                        distributeID.push(element.Followed)
                    });

                    distributeID = distributeID.filter(function(item) {
                        return item !== Number(result[7][0]['member_id'])
                    })
    
                    M_Post.remove({id_post: result[6][0].post_id}, function (err, result_) {
                        if (err){
                            console.log(err);
                            res.status(400).send('Status: Bad Request');
                        }else{
             
                            const m_post = new M_Post({
                                id_post: result[6][0].post_id,
                                label_content: String(req.body.content).replace(/<[^>]*>/g, '').substring(0,50)+"...", 
                                content: req.body.content, 
                            })
                            m_post.save().then(data => {

                                let data_not = {
                                    entity_type_id: 14,
                                    entity_id: req.body.subforum_id,
                                    notifier_id: result[7][0]['member_id'],
                                    actor_id: req.body.user_id,
                                    des_cription: "create thread",
                                    post_entity_id: result[6][0].post_id,
                                }

                                Notification.createNotification(data_not, function(error_code, not){
                                    if(error_code == 0){
                                        console.log(not)
                                        res.status(400).send('Status: Bad Request')
                                    }else{

                                        data_not = {
                                            entity_type_id: 16,
                                            entity_id: req.body.subforum_id,
                                            notifier_id: distributeID,
                                            actor_id: req.body.user_id,
                                            des_cription: "create thread",
                                            post_entity_id: result[6][0].post_id,
                                        }
                                        
                                        Notification.createNotificationDistribute(data_not, function(error_code, noterr){
                                            if(error_code == 0){
                                                console.log(noterr)
                                                res.status(400).send('Status: Bad Request')
                                            }
                                        });

                                        res.status(200).send({thread_id:result[5][0].thread_id, post_id:result[6][0].post_id})
                                    }
                                });
                              
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(400).send('Status: Bad Request')
                            })
                            
                        }
                    });
                }

            }
        });
    }

    static getHead(req, res){
        Thread.getHead(req.query, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result[0]);
            }
        });
    }

    static getOther(req, res){
        Thread.getOther(req.query,function(error_code, result){
        
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                let datax = [];
                let type = String(req.query.sorting_setting);
                let thread_id = -1; if(req.query.thread_id) thread_id = Number(req.query.thread_id);

                if(type !== 'recent_activity' && type !== 'total_post' && thread_id == -1) {
                    if(result.length > 0){
                        datax.push(result[0]);
                        datax.push(result[1])
                    }else{
                        datax.push([]);
                        datax.push([]);
                    }
                }else{
                    datax.push(result);
                    datax.push([]);
                }
                res.status(200).send(datax);
            }
        });
    }


    static pinThread(req, res){
        Thread.pin(req.body,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                
                delcache('/thread/others/?subforum_id='+req.body.subforum_id+'&sorting_setting=-&page=0&thread_id=-1');
                if(req.body.priority === 0){

                    let data_not = {
                        entity_type_id: 15,
                        entity_id: req.body.subforum_id,
                        notifier_id: result[2][0]['member_id'],
                        actor_id: req.body.user_id,
                        des_cription: "pin thread"
                    }
                    Notification.createNotificationNotKeep(data_not, function(error_code, result){
                        if(error_code == 0){
                            console.log(result)
                            res.status(400).send('Status: Bad Request')
                        }else{
                            res.status(200).send(result);
                        }
                    });

                }else{
                    res.status(201).send('Status: Created');
                }
               
            }
        });
    }

    static deleteThread(req, res){
        Thread.delete(req.body,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(201).send('Status: Created')
            }
        });
    }

    static getLatest(req, res){
        Thread.latest(function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }
    
    static getLatestSuper(req, res){
        Thread.latestSuper(function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getListLatest(req, res){
        Thread.listLatest(req.query ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getListTop(req, res){
        Thread.listTop(req.query ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getListSearch(req, res){
        Thread.listSearch(req.query ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getSuggest(req, res){
        Thread.getSuggest(req.query ,function(error_code, result){
            console.log(result)
            if(error_code == 0){
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

}

module.exports = thread;