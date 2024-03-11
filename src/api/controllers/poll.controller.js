const Poll = require('../models/poll.model');

const M_Poll = require('../schema/mongodb/poll.schema');
const generateString = require('../../helper/randomString');
const hashCode = require('../../helper/hashCode');
const MysqlQuery = require("../query/mysql.query")


const insertPoll = (reqb, next, count = 0) => {
    
    let id_poll = String(generateString(Number(process.env.HASH_ID_POLL_LENGTH)).concat(hashCode(String(reqb.user_id))));
    count = count + 1;
    const m_poll = new M_Poll({
        poll_id: id_poll,
        id_user: reqb.user_id,
        title: String(reqb.title).trim(),
        tags: reqb.tags,
        items: reqb.items,
    });

    m_poll.save().then(data => {
        next(true, id_poll)
    })                            
    .catch(err => {
        if(err.code === 11000 && count < 5) {
            insertPoll(reqx, next, count);
        }else{
           next(false, err)
        }
    });

}

const getInfoUser = (data, next) => {
    if(data){
        if(data.length > 0){
            let ReArr = JSON.parse(JSON.stringify(data));
            let listIDUser = ReArr.map(a => a.id_user);
            let State = "SELECT Member_ID, name, user_name FROM MemberProfile WHERE Member_ID IN ("+listIDUser.join(',')+");";
            MysqlQuery.select(State ,function(error_code, result){
                if(error_code == 0){
                    next(false, result)
                }else{
                    let element;
                    for(let i = 0; i < ReArr.length; i++){
                        element = result.find(o => o.Member_ID === ReArr[i].id_user);
                        ReArr[i].name = element.name;
                        ReArr[i].user_name = element.user_name;
                    }
                    next(true, ReArr)
                }
            });
        }else{
            next(true, [])
        }
    }else{
        next(true, [])
    }

}

class poll {
    
    static insert(req, res){
        var datas = req.body;
        for(let i = 0; i < datas.items.length; i++){
            datas.items[i]['id'] = i+1;
        }
        insertPoll(datas, (status, id_poll) => {
            if(status){
                res.status(200).send({poll_id: id_poll});
            }else{
                res.status(400).send('Status: Bad Request');
            }
        })
    }

    static delete(req, res){

      let jDel = {}

      if(Number(req.body.role) === 1){
        jDel = { poll_id: req.body.poll_id };
      }else{
        jDel = { id_user: req.body.user_id, poll_id: req.body.poll_id };
      }

      M_Poll.deleteMany( jDel , (error, result) => {
        if (error) {
          res.status(400).send('Status: Bad Request')
        } else {
          res.status(201).send('Status: Created');
        }
      });
      
    }


    static get(req, res){
        M_Poll.find({poll_id: req.query.id},{'_id': 0}).lean().then(data => {
            if(data.length > 0){

                Poll.get(data[0].id_user, function(error_code, result){
                    if(error_code == 0){
                        res.status(400).send('Status: Bad Request');
                    }else{
                        let datax = data[0];
                        datax['member_info'] = result[0];

                        let searchTerms = datax['tags'].concat(datax['title'].split(" "));
                        searchTerms = searchTerms.filter(function(entry) { return entry.trim() != ''; });

                  
                       let invalid = /[°"§%()\[\]{}=\\?´`'#<>|,;.:+_-]+/g;       const regexSearchTerms = searchTerms.map(term => new RegExp(term.replace(invalid, ""), 'i'));

                        let lowPriorityPollIds = [];
                        if(req.query?.low_list)
                        if(req.query.low_list?.length > 0){
                          lowPriorityPollIds = req.query.low_list.split(",");
                          lowPriorityPollIds = lowPriorityPollIds.filter(function(entry) { return entry.replace(invalid, "").trim() != ''; });
                        }

                        M_Poll.aggregate([
                            {"$match" :{
                                $or: [
                                    {"title": { "$in": regexSearchTerms }},
                                    {"tags": { "$in" : datax['tags'] }},
                                    { tags: { $exists: false } },  // Match documents where 'tags' doesn't exist
                                    { tags: { $size: 0 } }         // Match documents where 'tags' is an empty array
                                ],
                                poll_id: { $ne: datax['poll_id'] }
                              }
                            },
                            {
                                "$addFields": {
                                  "titleArray": { "$split": ["$title", " "] }
                                }
                            },
                            {
                                "$addFields": {
                                  "priority": {
                                    "$cond": {
                                      "if": { "$in": ["$poll_id", lowPriorityPollIds] },
                                      "then": -9,
                                      "else": 1
                                    }
                                  },
                                  "relevance": {
                                        "$sum":  [
                                            { "$cond": [{ "$gt": [{ "$size": { "$setIntersection": ["$tags", searchTerms] } }, 0] }, 2, 1] },
                                            { "$cond": [{ "$gt": [{ "$size": { "$setIntersection": ["$titleArray", searchTerms] } }, 0] }, 2, 1] }
                                        ]
                                  }
                                }
                              },
                              {
                                "$project": {
                                  "_id": 1,
                                  "items": 1,
                                  "poll_id": 1,
                                  "title": 1,
                                  "id_user": 1,
                                  "relevant": "$relevance",
                                  "priority": 1,
                                  "titleArray": 1,
                                }
                              },
                              {
                                "$group": {
                                  "_id": "$_id",
                                  "poll_id": { "$first": "$poll_id" },
                                  "title": { "$first": "$title" },
                                  "id_user": { "$first": "$id_user" },
                                  "relevant": { "$first": "$relevant" },
                                  "priority": { "$first": "$priority" },
                                  "titleArray": { "$first": "$titleArray" },
                                  "total_votes": {
                                    "$sum": { "$sum": "$items.votes" } 
                                  }
                                }
                              },
                              {
                                $sort: { priority: -1, relevant: -1 }
                              },
                              {"$limit": Number(process.env.SUGGEST_POLL_PER_PAGE) },

                        ]).exec((err, data) => {
                          if(err) {
                              res.status(200).send([]);
                          }else{
                              getInfoUser(data, (code, result_) => {
                                if(code){
                                    datax['recommend_list'] = result_;
                                    res.status(200).send(datax);
                                }else{
                                    res.status(400).send(result_);
                                }
                              })
                          }
                        })

                    }
                });

            }else res.status(400).send('Status: Bad Request');
        }).catch(err => {
            res.status(400).send('Status: Bad Request');
        });

    }



    static upVote(req, res){

        M_Poll.findOneAndUpdate(
          {poll_id: req.body.poll_id, 'items.id': req.body.id},
          {$inc: {'items.$.votes': 1} })
          .exec((err, data) => {

                if(err){
                    res.status(400).send('Status: Bad Request')
                }else {

                    let de_id = Number(req.body.de_id);

                    if(de_id > 0 && data){
                        let obj = data.items.find(o => Number(o.id) === de_id);

                        if(obj){
                            if(Number(obj.votes) > 0 ){

                              M_Poll.findOneAndUpdate(
                                {poll_id: req.body.poll_id, 'items.id': de_id},
                                {$inc: {'items.$.votes': -1} })
                                .exec((err, data) => {
                                        if(err){
                                            res.status(400).send('Status: Bad Request')
                                        }else {
                                            res.status(201).send('Status: Created');
                                        }
                                })

                            }else{
                                res.status(201).send('Status: Created');
                            }
                        }else{
                            res.status(201).send('Status: Created');
                        }
                    }else{
                        res.status(201).send('Status: Created');
                    }
                }
          })
    }


    static getTopList(req, res){

        let page = Number(req.query.page);

        let limit = 0;

        if(page == -1){
            limit = 3;
            page = 0;
        }else{
            limit = Number(process.env.POLL_PER_PAGE);
        }
      
        M_Poll.aggregate([
              {
                "$project": {
                  "_id": 1,
                  "items": 1,
                  "poll_id": 1,
                  "title": 1,
                  "id_user": 1,
                }
              },
              {
                "$group": {
                  "_id": "$_id",
                  "poll_id": { "$first": "$poll_id" },
                  "title": { "$first": "$title" },
                  "id_user": { "$first": "$id_user" },
                  "total_votes": {
                    "$sum": { "$sum": "$items.votes" } 
                  }
                }
              },
              {"$sort": {"total_votes": -1 , "_id": 1}},
              {"$skip" : limit*page},
              {"$limit": limit},
            
        ]).exec((err, data) => {

            if(err){
                res.status(400).send('Status: Bad Request');
            }else{
                getInfoUser(data, (code, result) => {
                    if(code){
                        res.status(200).send(result);
                    }else{
                        res.status(400).send('Status: Bad Request');
                    }
                })
            }

        })
    }



    static getLatestList(req, res){

        let page = Number(req.query.page);

        let limit = 0;

        if(page == -1){
            limit = 3;
            page = 0;
        }else{
          limit = Number(process.env.POLL_PER_PAGE);
        }
      
        M_Poll.aggregate([
              {
                "$project": {
                  "_id": 1,
                  "items": 1,
                  "poll_id": 1,
                  "title": 1,
                  "id_user": 1,
                }
              },
              {
                "$group": {
                  "_id": "$_id",
                  "poll_id": { "$first": "$poll_id" },
                  "title": { "$first": "$title" },
                  "id_user": { "$first": "$id_user" },
                  "total_votes": {
                    "$sum": { "$sum": "$items.votes" } 
                  }
                }
              },
              {"$sort": {"_id": -1}},
              {"$skip" : limit*page},
              {"$limit": limit},
            
        ]).exec((err, data) => {

            if(err){
                res.status(400).send('Status: Bad Request');
            }else{
                getInfoUser(data, (code, result) => {
                    if(code){
                        res.status(200).send(result);
                    }else{
                        res.status(400).send(result);
                    }
                })
            }

        })
    }



    static getMemberLatestList(req, res){

        let page = Number(req.query.page);
        let limit = Number(process.env.POLL_PER_PAGE);

        M_Poll.aggregate([
              {$match: { 
                  id_user: Number(req.query.member_id) }
                },
              {
                "$project": {
                  "_id": 1,
                  "items": 1,
                  "poll_id": 1,
                  "title": 1,
                  "id_user": 1,
                }
              },
              {
                "$group": {
                  "_id": "$_id",
                  "poll_id": { "$first": "$poll_id" },
                  "title": { "$first": "$title" },
                  "id_user": { "$first": "$id_user" },
                  "total_votes": {
                    "$sum": { "$sum": "$items.votes" } 
                  }
                }
              },
              {"$sort": {"_id": -1}},
              {"$skip" : limit*page},
              {"$limit": limit},
            
        ]).exec((err, data) => {

            if(err){
                res.status(400).send('Status: Bad Request');
            }else{
                getInfoUser(data, (code, result) => {
                    if(code){
                        res.status(200).send(result);
                    }else{
                        res.status(400).send(result);
                    }
                })
            }

        })
    }




    static getListBySearch(req,res){

        let page = Number(req.query.page);
        let limit = Number(process.env.POLL_PER_PAGE);

        let searchTerms =  String(req.query.search);
        searchTerms = searchTerms.split(' ');
        const regexSearchTerms = searchTerms.map(term => new RegExp(term, 'i'));

        M_Poll.aggregate([
            {
                $match: {
                  $or: [
                    { tags: { $in: regexSearchTerms } },
                    { title: { $in: regexSearchTerms } }
                  ]
                }
              },
              {
                "$addFields": {
                  "titleArray": { "$split": ["$title", " "] }
                }
              },
              {
                $addFields: {
                  relevance: {
                    $sum: [
                        {
                          $cond: [
                            {
                              $gt: [
                                { $size: { $setIntersection: ["$tags", searchTerms] } },
                                0
                              ]
                            },
                            { $size: { $setIntersection: ["$tags", searchTerms] } },
                            1
                          ]
                        },
                        {
                          $cond: [
                            {
                              $gt: [
                                { $size: { $setIntersection: ["$titleArray", searchTerms] } },
                                0
                              ]
                            },
                            { $size: { $setIntersection: ["$titleArray", searchTerms] } },
                            1
                          ]
                        }
                      ]
                  }
                }
              },
              {
                  "$project": {
                    "_id": 1,
                    "items": 1,
                    "poll_id": 1,
                    "title": 1,
                    "id_user": 1,
                    "relevance": 1,
                  }
                },
                {
                  "$group": {
                    "_id": "$_id",
                    "poll_id": { "$first": "$poll_id" },
                    "title": { "$first": "$title" },
                    "id_user": { "$first": "$id_user" },
                    "relevance": { "$first": "$relevance" },
                    "total_votes": {
                      "$sum": { "$sum": "$items.votes" } 
                    }
                  }
                },
                {"$sort": { "relevance": -1, "total_votes": -1, "_id": 1 }},
                {"$skip" : limit*page},
                {"$limit": limit},
            
        ]).exec((err, data) => {
            if(err){
              res.status(400).send('Status: Bad Request');
            }else{
              getInfoUser(data, (code, result) => {
                if(code){
                    res.status(200).send(result);
                }else{
                    res.status(400).send('Status: Bad Request');
                }
              });
            }
        })
    }

}

module.exports = poll;