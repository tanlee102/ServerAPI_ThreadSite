const M_Word = require('../schema/mongodb/word.schema');




class word {



    static getByWordBlock(req, res){
        M_Word.findOne({label: 'word-block'}).exec(function (err, data) {
            if (err) res.status(400).send(err);
            
            else{

                res.status(200).send(JSON.stringify(data.words));
            }
        });
    }

    static updateByWordBlock(req, res, next){
        
        M_Word.findOneAndUpdate({ label: 'word-block'},
            { 
                $set: {
                         "words": req.body.words
                }
            },
            { upsert: true }).exec((err, data) => {
              if(err){
                console.log(err)
                res.status(400).send('Status: Bad Request')
              }else {
                return next();
              }
        });
    }



    

}

module.exports = word;