const TagThread = require('../models/tagthread.model');

class tagthread {

    static getListColorPanel(req, res){
        TagThread.getListColorPanel(function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(200).send(result)
            }
        });
    }


    static getall(req, res){
        TagThread.getall(function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(200).send(result)
            }
        });
    }


    static insert(req, res){
        console.log(req.body)
        TagThread.insert( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(201).send('Status: Created')
            }
        });
    }


}

module.exports = tagthread;