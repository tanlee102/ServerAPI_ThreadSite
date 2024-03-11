const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');


class UserMiddleWare{


    static banList = [];

    static checkParameters = (req,res,next) => {
        if(validationResult(req).isEmpty()){
            return next();
        }else{
            res.status(400);
            res.send('Invalid Parameter or Headers');
        }
    }


    static checkAuthUserDefault = (req,res,next) => {

        if(validationResult(req).isEmpty() && req.headers.authorization){

            let token = (String(req.headers.authorization).split(" "))[1];
            let typePara = ((req.method==='GET') ? 'query' : 'body'); 

            if(token === String(process.env.NAME_UNTOKEN)){
                req[typePara].user_id = '-1';
                return next();
            }else{
                jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , function(err, decoded) {
                    if(err){
                        res.status(400);
                        res.send('Token Unauthorized');
                    }else{
                        req[typePara].role = decoded.user.role;
                        req[typePara].user_id = decoded.user.id;
                        return next();
                    }
                });
            }

        }else{
            res.status(400);
            res.send('Invalid Parameter or Headers');
        }

    }


    static checkAuthUser = (req,res,next) => {

        if(validationResult(req).isEmpty() && req.headers.authorization){

            let typePara = ((req.method==='GET') ? 'query' : 'body'); 
            
            jwt.verify((String(req.headers.authorization).split(" "))[1], process.env.ACCESS_TOKEN_SECRET , function(err, decoded) {
                if(err){
                    res.status(400);
                    res.send('Token Unauthorized');
                }else{

                    if(UserMiddleWare.banList.includes(decoded.user.id)){
                        res.status(403);
                        res.send('You haved banned!!!');
                    }else{
                        req[typePara].role = decoded.user.role;
                        req[typePara].user_id = decoded.user.id;
                        return next();
                    }
                }
            });
            
        }else{
            res.status(400);
            res.send('Invalid Parameter or Headers');
        }

    }


    static checkAuthAdmin = (req,res,next) => {

        if(validationResult(req).isEmpty() && req.headers.authorization){

            let typePara = ((req.method==='GET') ? 'query' : 'body');

            jwt.verify((String(req.headers.authorization).split(" "))[1], process.env.ACCESS_TOKEN_SECRET , function(err, decoded) {
                if(err){
                    res.status(400);
                    res.send('Token Unauthorized');
                }else{

                    if(decoded.user.role === 1){
                        req[typePara].role = decoded.user.role;
                        req[typePara].user_id = decoded.user.id;
                        return next();
                    }else{
                        res.status(400);
                        res.send('Admin Unauthorized');
                    }

                }
            });
            
        }else{
            res.status(400);
            res.send('Invalid Parameter or Headers');
        }

    }



    static checkTry = (req,res,next) => {
        if(validationResult(req).isEmpty()){
            res.status(200);
            res.send('OK');
        }else{
            res.status(400);
            res.send('Invalid Parameter');
        }
    }


}

module.exports = UserMiddleWare;