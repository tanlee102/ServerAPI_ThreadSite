const M_Msg = require('../schema/mongodb/msg.schema');
const M_ReMsg = require('../schema/mongodb/remsg.schema');
const MysqlQuery = require("../query/mysql.query")
const Notification = require('../models/notification.model');
const Member = require('../models/member.model');


class comment {

    static count = process.env.MSGS_PER_PAGE;

    static insertMsg(req, res){
        M_Msg.findOne().sort({ID : -1}).exec(function (err, ids) {
            let ID = 0;
            if(ids !== null) ID = ids.ID;
            const m_msg = new M_Msg({
                ID: (ID+1),
                Member_ID: req.body.user_id,
                MemberWall_ID: req.body.member_id,
                text: String(req.body.text),
            })
            m_msg.save().then(data => {
                let data_not = {
                    entity_type_id: 17,
                    entity_id: req.body.member_id,
                    notifier_id: req.body.member_id,
                    actor_id: req.body.user_id,
                    des_cription: "send message",
                }
                Notification.createNotificationNotKeep(data_not, function(error_code, result){
                    if(error_code == 0){
                        console.log(result)
                        res.status(400).send('Status: Bad Request')
                    }else{
                        res.status(200).send(data);
                    }
                });
            })
            .catch(err => {
                console.log(err);
            })
        });
    }


    static async deleteMsg(req, res){
        let result = await M_Msg.deleteOne({ ID: req.body.id, Member_ID: req.body.user_id });
        if(result.deletedCount == 1){
            res.status(201).send('Status: Created');
        }else{
            result = await M_Msg.deleteOne({ ID: req.body.id, MemberWall_ID: req.body.user_id });
            if(result.deletedCount == 1){
                res.status(201).send('Status: Created');
            }else{
                if(req.body.role == 1){
                    result = await M_Msg.deleteOne({ ID: req.body.id });
                    if(result.deletedCount == 1){
                        res.status(201).send('Status: Created');
                    }else{
                        res.status(400).send('Status: Bad Request');
                    }
                }else{
                    res.status(400).send('Status: Bad Request');
                }
            }
        }
    }


    static insertReMsg(req, res){
        M_Msg.findOne({"ID": req.body.id}).sort({ID : -1}).exec(function (err, idwall) {
            if(err){
                res.status(400).send('Status: Bad Request')
            }else{
                M_ReMsg.findOne({"MemberMsg_ID": req.body.id}).sort({ID_ : -1}).exec(function (err, ids) {
                    if(err){
                        res.status(400).send('Status: Bad Request')
                    }else{
                        let ID_ = 0;
                        if(ids !== null) ID_ = ids.ID_;
                        const m_remsg = new M_ReMsg({
                            MemberMsg_ID: req.body.id,
                            MemberWall_ID: idwall.MemberWall_ID,
                            ID_: (ID_+1),
                            Member_ID: req.body.user_id,
                            text: String(req.body.text)
                        })
                        m_remsg.save().then(data => {
                            res.status(200).send(data)
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    }
                });
            }
        });
    }

    static async deleteReMsg(req, res){
        let result = await M_ReMsg.deleteOne({ MemberMsg_ID: req.body.id, ID_: req.body.id_, Member_ID: req.body.user_id });
        if(result.deletedCount == 1){
            res.status(201).send('Status: Created');
        }else{
            result = await M_ReMsg.deleteOne({ MemberMsg_ID: req.body.id, ID_: req.body.id_, MemberWall_ID: req.body.user_id });
            if(result.deletedCount == 1){
                res.status(201).send('Status: Created');
            }else{
                if(req.body.role == 1){
                    result = await M_ReMsg.deleteOne({ MemberMsg_ID: req.body.id, ID_: req.body.id_ });
                    if(result.deletedCount == 1){
                        res.status(201).send('Status: Created');
                    }else{
                        res.status(400).send('Status: Bad Request');
                    }
                }else{
                    res.status(400).send('Status: Bad Request');
                }
            }
        }
    }

    static detachIDUser(arr){
        let ReArr = [];
        arr.map((item) => {
            if (!ReArr.includes(item.Member_ID)) ReArr.push(item.Member_ID)
        });
        return ReArr;
    }

    static async getMsgs(req, res){
        
        let member_id = 0;
        if(req.query.member_id) member_id = req.query.member_id;

        let quey = {}
        if(Number(req.query.curLoadID) == 0) quey = { MemberWall_ID: member_id }
        else quey = {MemberWall_ID: member_id,  ID: { $lt: Number(req.query.curLoadID) } }

        M_Msg
        .find(quey, { '_id': 0})
        .sort({'ID': -1})
        .limit(comment.count)
        .exec(async function(err, posts) {
            if(err){
                res.status(400).send('Status: Bad Request');
            }else
            if(posts.length > 0){
                let ReArr = JSON.parse(JSON.stringify(posts));
                let listIDUser = comment.detachIDUser(ReArr);
                for(let i = 0; i < ReArr.length; i++){
                    ReArr[i].replydata = JSON.parse(JSON.stringify((await M_ReMsg.find({MemberMsg_ID: ReArr[i].ID}).sort({ ID_: -1 }).limit(6)).reverse()));
                    if(ReArr[i].replydata.length >= 6){
                        ReArr[i].replydata.splice(0, 1);
                        ReArr[i].isMore = true;
                    } 
                    listIDUser = listIDUser.concat(comment.detachIDUser(ReArr[i].replydata));
                }
                listIDUser = listIDUser.filter((item, pos) => listIDUser.indexOf(item) === pos);
                let State = "select Member_ID, name, user_name, thumbnail from MemberProfile where Member_ID IN ("+listIDUser.join(',')+")";
                
                MysqlQuery.select(State ,function(error_code, result){
                    if(error_code == 0){
                        res.status(400).send('Status: Bad Request');
                    }else{
                        let element;
                        for(let i = 0; i < ReArr.length; i++){
                            element = result.find(o => o.Member_ID === ReArr[i].Member_ID);
                            if (element && element.name) {
                                ReArr[i].name = element.name;
                                ReArr[i].user_name = element.user_name;
                                ReArr[i].thumbnail = element.thumbnail;
                                for(let k = 0; k < ReArr[i].replydata.length; k++){
                                    element = result.find(o => o.Member_ID === ReArr[i].replydata[k].Member_ID);
                                    ReArr[i].replydata[k].name = element.name;
                                    ReArr[i].replydata[k].user_name = element.user_name;
                                    ReArr[i].replydata[k].thumbnail = element.thumbnail;
                                }
                            }
                        }
                        res.status(200).send(ReArr);
                    }
                });
            }else{
                res.status(200).send([]);
            }
        });

    }

    
    static loadReMsgs(req, res){

        M_ReMsg
        .find({MemberMsg_ID: req.query.id, ID_: { $lt: req.query.curLoadID }})
        .sort({ ID_: -1 })
        .limit(comment.count)
        .exec(function(err, posts){
            if(err){
                res.status(400).send('Status: Bad Request');
            }else{
                let ReArr = JSON.parse(JSON.stringify(posts.reverse()));
                let isMore = false;
                if(ReArr.length >= 6){
                    isMore = true;
                    ReArr.splice(0, 1);
                }
    
                let listIDUser = comment.detachIDUser(ReArr);
                let State = "select Member_ID, name, user_name, thumbnail from MemberProfile where Member_ID IN ("+listIDUser.join(',')+")";
                
                MysqlQuery.select(State ,function(error_code, result){
                    if(error_code == 0){
                        res.status(400).send('Status: Bad Request');
                    }else{
                        let element;
                        for(let i = 0; i < ReArr.length; i++){
                            element = result.find(o => o.Member_ID === ReArr[i].Member_ID);
                            ReArr[i].name = element.name;
                            ReArr[i].user_name = element.user_name;
                            ReArr[i].thumbnail = element.thumbnail;
                        }
                        res.status(200).send({isMore: isMore, arr: ReArr});
                    }
                });
            }
        })

    }

}
module.exports = comment;