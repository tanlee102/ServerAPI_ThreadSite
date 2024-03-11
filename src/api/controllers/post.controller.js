const Post = require('../models/post.model');
const Notification = require('../models/notification.model');

const M_Post = require('../schema/mongodb/post.schema');
const M_Range = require('../schema/mongodb/range.schema');
const M_Readed = require('../schema/mongodb/readed.schema');
const { delcache } = require('../middleware/cache.middleware');

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

  function formatOnlyDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-')
    );
  }


class post {

    static getLikeData(req, res){
        if(req.query.user_id === -1){
            res.status(200).send([]);
        }else{
            Post.getLikeData( req.query, function(error_code, result){
                if(error_code == 0){
                    console.log(result);
                    res.status(400).send('Status: Bad Request');
                }else{
                    res.status(200).send(result);
                }
            });
        }
    }

    static getData(req, res){
        Post.getData(req.query,function(error_code, result){

            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request')
            }else{
                let listID = result[0];
                
                let IDx = [];
                let ReID = [];
                listID.forEach(element => {
                    IDx.push(element.ID);
                    if(element.RePost_ID) ReID.push(element.RePost_ID);
                });

                M_Post.find({id_post: {$in: ReID}}).then(data => {

                    M_Post.find({id_post: {$in: IDx}}).then(data_ => {

                        let datax = [];
                        datax.push(result[0]);
                        datax.push(data_);
                        datax.push(data);
                        datax.push(result[1]);
                        datax.push(result[2][0]);

                        Post.addView( req.query.thread_id ,function(error_code, result){
                            if(error_code == 0){
                                res.status(400).send('Status: Bad Request');
                            }else{
                                res.status(200).send(datax);
                            }
                        });

                    }).catch(err => {
                        console.log(err);
                        res.status(400).send('Status: Bad Request');
                    })

                }).catch(err => {
                    console.log(err);
                    res.status(400).send('Status: Bad Request');
                })
            }
        });
    }

    static getListManagePost(req, res){
        Post.getListManagePost(req.query,function(error_code, result){

            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request');
            }else{

                let listID = result;

                let IDx = [];
                let ReID = [];
                listID.forEach(element => {
                    IDx.push(element.ID);
                    if(element.RePost_ID) ReID.push(element.RePost_ID);
                });

                M_Post.find({id_post: {$in: ReID}}).then(data => {

                    M_Post.find({id_post: {$in: IDx}}).then(data_ => {
                        
                        let datax = [];
                        datax.push(listID);
                        datax.push(data_.reverse());
                        datax.push(data);

                        res.status(200).send(datax);

                    }).catch(err => {
                        console.log(err);
                        res.status(400).send('Status: Bad Request');
                    })

                }).catch(err => {
                    console.log(err);
                    res.status(400).send('Status: Bad Request');
                })
            }
        });
    }

    static insert(req, res){

        Post.create( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request');
            }else{

                if(Number(result[6][0].is_block) == 1){
                    res.status(400).send('Status: Bad Request')
                }else{

                    M_Post.remove({id_post: result[4][0].post_id}, function (err, result_) {
                        if (err){
                            console.log(err);
                        }else{
                            if(req.body.name_user_reply === '') req.body.name_user_reply = "-";
                            const m_post = new M_Post({
                                id_post: result[4][0].post_id,
                                content: req.body.content, 
                                label_content: String(req.body.content).replace(/<[^>]*>/g, '').substring(0,50)+"...", 
                                name_user_reply: req.body.name_user_reply, 
                            })

                            m_post.save().then(data => {
                                let data_not = {};
                                if(req.body.reply_id === 0){
                                    data_not = {
                                        entity_type_id: 11,
                                        entity_id: req.body.thread_id,
                                        notifier_id: result[5][0]['member_id'],
                                        actor_id: req.body.user_id,
                                        post_entity_id: result[4][0]['post_id'],
                                        des_cription: "comment thread"
                                    }
                                }else{
                                    data_not = {
                                        entity_type_id: 5,
                                        entity_id: req.body.reply_id,
                                        notifier_id: result[5][0]['member_id'],
                                        actor_id: req.body.user_id,
                                        post_entity_id: result[4][0]['post_id'],
                                        des_cription: "reply post"
                                    }
                                }
                    
                                Notification.createNotification(data_not, function(error_code, result_){
                                    if(error_code == 0){
                                        console.log(result_)
                                        res.status(400).send('Status: Bad Request')
                                    }else{
                                        Post.getTotalByThread(req.body.thread_id, function(error_code, result__){
                                            if(error_code == 0){
                                                res.status(400).send('Status: Bad Request')
                                            }else{
                                                let final_page = Math.ceil(result__[0].total/process.env.POST_PER_PAGE);
                                                delcache("/post?thread_id="+req.body.thread_id+"&page="+final_page);
                                                res.status(200).send({id: result[4][0]['post_id']});
                                            }
                                        });
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

    static deleteOne(req, res){
        Post.delete( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request')
            }else{
                if(Number(result.affectedRows) == 1){
                    M_Post.remove({ id_post: req.body.post_id }, function (err, result_) {
                        if (err){
                            console.log(err);
                            res.status(400).send('Status: Bad Request')
                        }else{
                            res.status(200).send(result_);
                        }
                    });
                }else{
                    res.status(400).send('Status: Bad Request')
                }
            }
        });
    }

    static getIndexPost(req, res){
        Post.getIndexPost( req.query ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static setLike(req, res){
        Post.setLike( req.body ,function(error_code, result){

            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request')
            }else{
                if(req.body.isliked == 1){

                    if(Number(result[4][0].is_block) == 1){
                        res.status(400).send('Status: Bad Request')
                    }else{

                        let data_not = {
                            entity_type_id: 4,
                            entity_id: req.body.post_id,
                            notifier_id: result[3][0]['member_id'],
                            actor_id: req.body.user_id,
                            post_entity_id: req.body.post_id,
                            des_cription: "like post"
                        }
                        Notification.createNotificationNotKeep(data_not, function(error_code, result){
                            if(error_code == 0){
                                console.log(result)
                                res.status(400).send('Status: Bad Request')
                            }else{
                                res.status(200).send(result);
                            }
                        });
                    }
                }else{
                    res.status(201).send('Status: Created')
                }      
            }
        });
    }


//--------------------------------------------------------------------------------
    ///THIS TRASH I NEED TO SOVLE IT LATER:
    static getNewFeed(req, res){

        let user_id = req.query.user_id;
        let limit = 9;

        M_Readed.find({id_user: user_id}).then(posts => {

            let list_posts = [-1];
            if(posts.length > 0)
                posts[0]['posts'].forEach(element => {
                    list_posts.push(element.id_post);
                });

            let d = new Date();
            d.setDate(d.getDate() - 7);

            Post.getFeedByTime( user_id , list_posts , formatOnlyDate(new Date(d)) , limit ,function(error_code, result){
                if(error_code == 0){
                    console.log(result);
                    res.status(400).send('Status: Bad Request')
                }else{

                    let reValue = result.pop();
                    list_posts = [];
                    
                    if(reValue.length > 0){
                        
                        reValue.forEach(element => {
                            list_posts.push({
                                id_post: element.ID,
                                time: (new Date(element.time).toISOString())
                            });
                        });

                        M_Readed.findOneAndUpdate({ id_user: user_id},
                            { $push: { "posts": list_posts } },
                            { upsert: true }).exec((err, updateposts) => {

                                if(err){
                                    console.log(err)
                                    res.status(400).send('Status: Bad Request')
                                }else {
                                    d.setDate(d.getDate() - 8);
                                    M_Readed.findOneAndUpdate({ id_user: user_id},
                                
                                        { $pull:{ "posts": { time: { $lt: (new Date(d).toISOString())  } } } },
                                        { upsert: true }).exec((err, removeposts) => {
                                        if(err){
                                            console.log(err)
                                            res.status(400).send('Status: Bad Request')
                                        }else {

                                            let listID = reValue;
                                            let IDx = [];
                                            let ReID = [];
                                            listID.forEach(element => {
                                                IDx.push(element.ID);
                                                if(element.RePost_ID) ReID.push(element.RePost_ID);
                                            });
                            
                                            M_Post.find({id_post: {$in: ReID}}).then(data => {
                            
                                                M_Post.find({id_post: {$in: IDx}}).then(data_ => {
                                                    let datax = [];
                                                    datax.push(reValue);
                                                    datax.push(data_.reverse());
                                                    datax.push(data);

                                                    res.status(200).send(datax);
                                                }).catch(err => {
                                                    console.log(err);
                                                    res.status(400).send('Status: Bad Request');
                                                })
                                            }).catch(err => {
                                                console.log(err);
                                                res.status(400).send('Status: Bad Request');
                                            });
                                        }
                                    });
                                }
                            });
                    }else{
                        res.status(200).send(reValue)
                    }
                }
            });
        }).catch(err => {
            console.log(err);
            res.status(400).send('Status: Bad Request');
        });
    }
}

module.exports = post;