const Member = require('../models/member.model');

module.exports.untouchableAdmin = (req, res, next) => {

    Member.getMemberRole( req.body.member_id , function(error_code, result){
        if(error_code == 0){
            res.status(400).send('Status: Bad Request');
        }else{
            if(Number(result[0].MemberRole_ID) > 0){
                res.status(400).send('Status: Bad Request');
            }else{
                return next();
            }
        }
    });

}