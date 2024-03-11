const Privacy = require('../models/privacy.model');

class privacy {

    static get(req, res){
        Privacy.get(req.query.user_id, (error_code, result) => {
            if(error_code == 0){
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(200).send(result[0])
            }
        });
    }

    static update(req, res){
        Privacy.update( req.body ,function(error_code, result){
            if(error_code == 0){
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(201).send('Status: Created')
            }
        });
    }

    // static list_check_privacy = [
    //     {url: '/member/posts/liked', atr: 'post_liked'},
    //     {url: '/member/followed', atr: 'member_following'},
    //     {url: '/msg/create', atr: 'send_message'},
    //     {url: '/msg/re/create', atr: 'send_message'},
    // ]


    // static checkPrivacy(req, res, next){

    //     let member_id = req.query.member_id  ? req.query.member_id : req.body.member_id;
    //     let user_id = req.query.user_id ? req.query.user_id  :  req.body.user_id;
        
    //     if(Number(member_id) === Number(user_id)){
    //         next();
    //     }else{
    //         Privacy.check(req.query.user_id ? req.query : req.body, (error_code, check) => {
    //             if(error_code == 0){
    //                 console.log(check)
    //                 res.status(400).send('Status: Bad Request')
    //             }else{

    //                 let lsc_privacy = privacy.list_check_privacy;
    //                 let is_allowed = false;
    //                 lsc_privacy.forEach(element => {
    //                     if(String(req.originalUrl).includes(element.url)){
    //                         if(check[0][0][element.atr] == 0 || (check[0][0][element.atr] == 1 && check[1].length > 0)){
    //                             is_allowed = true;
    //                         }
    //                     }
    //                 });
    //                 if(is_allowed == true){
    //                     next();
    //                 }else{
    //                     res.status(400).send('Status: Bad Request');
    //                 }
    //             }
    //         });
    
    //     }
    // }

}

module.exports = privacy;