const Category = require('../models/category.model');

class category{

    static insert(req, res){
        Category.insert( req.body.title ,function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(201).send('Status: Created')
            }
        });
    }

    static getall(req, res){
        Category.getall(function(error_code, result){
            if(error_code == 0){
                console.log(result);
                res.status(400).send('Status: Bad Request')
            }else{
                res.status(200).send(result)
            }
        });
    }
    
}

module.exports = category;