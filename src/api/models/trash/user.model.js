const MysqlQuery = require("../../query/mysql.query")

// const hashCode = require('../../helper/hashCode');
const generateString = require('../../../helper/randomString');

var moment = require('moment')

// function makeid(length) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//         result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
// }

class User{
    constructor() {}

    static trackUser(next){
        let State = "SELECT * FROM Member LEFT JOIN MemberProfile ON Member.ID=MemberProfile.Member_ID;";  
        MysqlQuery.select(State, next);
    }

    static checkUser(auth_id, type_auth, next){
        let State = "SELECT ID, MemberRole_ID, name, user_name, avatar FROM Member LEFT JOIN MemberProfile ON Member.ID=MemberProfile.Member_ID WHERE Auth_ID='"+auth_id+"' AND type_auth='"+type_auth+"' ;";  
        MysqlQuery.select(State, next);
    }

    static insertUserGoogle(data, next){
        let State= "SET @CUR_ID = (SELECT IFNULL(MAX(ID), 0) FROM Member) + 1; "+
        "INSERT INTO Member (ID, Auth_ID, type_auth) VALUES (@CUR_ID ,'"+data.id+"', 'gg'); "+
        "INSERT INTO MemberProfile (Member_ID, user_name, name, thumbnail, medium, avatar, email, contact) VALUES (@CUR_ID , CONCAT(@CUR_ID, '"+String(generateString(Number(process.env.HASH_ID_USER_LENGTH)))+"') , '"+data.displayName+"','"+data.picture+"','"+data.picture+"','"+data.picture+"', '"+String(data.email)+"', '"+String(data.email)+"'); "+
        // "INSERT INTO MemberProfile (Member_ID, user_name, name, thumbnail, medium, avatar, email, contact) VALUES (@CUR_ID , CONCAT(@CUR_ID, '"+String(data.email).replace('@gmail.com','')+"') , '"+data.displayName+"','"+data.picture+"','"+data.picture+"','"+data.picture+"', '"+String(data.email)+"', '"+String(data.email)+"'); "+
        "INSERT INTO Privacy (Member_ID, send_message, post_liked, member_following) VALUES (@CUR_ID, 0 ,0, 0); "+
        "SELECT @CUR_ID as ID;"+
        "SELECT CONCAT(@CUR_ID, '"+String(data.email).replace('@gmail.com','')+"') as USER_NAME;";
        MysqlQuery.insert(State, next);
    }
    
    // static insertUserFacebook(data, next){
    //     let rand = makeid(7);
    //     let State= "SET @CUR_ID = (SELECT IFNULL(MAX(ID), 0) FROM Member) + 1; "+
    //     "INSERT INTO Member (ID, Auth_ID, type_auth) VALUES (@CUR_ID ,'"+data.id+"', 'fb'); "+
    //     "INSERT INTO MemberProfile (Member_ID, user_name, name, thumbnail, medium, avatar, email, contact) VALUES (@CUR_ID , CONCAT(@CUR_ID, '"+rand+"') , '"+data.displayName+"','"+process.env.NON_AVATAR+"','"+process.env.NON_AVATAR+"','"+process.env.NON_AVATAR+"', '"+ String(data.email ?  data.email : ' ') +"', '"+ String(data.email ?  data.email : ' ') +"'); "+
    //     "INSERT INTO Privacy (Member_ID, send_message, post_liked, member_following) VALUES (@CUR_ID, 0 ,0, 0); "+
    //     "SELECT @CUR_ID as ID;"+
    //     "SELECT CONCAT(@CUR_ID, '"+rand+"') as USER_NAME;";
    //     MysqlQuery.insert(State, next);
    // }

    static getDetailUser(data, next){
        let State = 'SELECT  user_name ,IFNULL(name, "") as name, IFNULL(avatar, "") as avatar, IFNULL(birthday, "") as birthday,  IFNULL(quote, "") as quote,  IFNULL(address, "") as address,  IFNULL(contact, "") as contact FROM MemberProfile WHERE Member_ID = '+data.user_id+';'
        MysqlQuery.select(State, next);
    }

    static updateDetailUser(data, next){ 
        let setDate;
        if(moment(data.birthday, "YYYY/MM/DD").isValid()){
            setDate = ",birthday = '"+data.birthday+"'";
        }else{
            setDate = "";
        }
        let State = "UPDATE MemberProfile SET name = '"+data.name+"'"+setDate+", quote = '"+data.quote+"', address='"+data.address+"', contact='"+data.contact+"' WHERE Member_ID='"+data.user_id+"';"
        MysqlQuery.insert(State, next);
    }

    static checkUserName(data, next){
        let State = 'SELECT user_name FROM MemberProfile WHERE user_name="'+data.user_name+'";';
        MysqlQuery.select(State, next);
    }

    static updateUserName(data, next){
        let State = 'UPDATE MemberProfile SET user_name = "'+String(data.user_name).replace(/[^a-z0-9]/gi, '').replace(/\s/g,'').toLowerCase()+'" WHERE Member_ID = "'+data.user_id+'";';
        MysqlQuery.select(State, next);
    }

}

module.exports = User;