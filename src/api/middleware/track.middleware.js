const MysqlQuery = require('../query/mysql.query')

module.exports.trackIdMember = (req,res,next) => {

    let typePara = ((req.method==='GET') ? 'query' : 'body'); 
 
    if(req[typePara].user_name){
        MysqlQuery.select("SELECT Member_ID FROM MemberProfile WHERE user_name = '"+req[typePara].user_name+"'", function(error_code, result){
        
            if(error_code == 0){
                req[typePara].member_id = -1;
                return next();
            }else{
                if(result[0]){
                    req[typePara].member_id = result[0].Member_ID;
                }else{
                    req[typePara].member_id = -1;
                }
                return next();
            }
        });
    }

}