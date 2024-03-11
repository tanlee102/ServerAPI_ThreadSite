const { getcache, setcache } = require('../middleware/cache.middleware');
const SubForum = require('../models/subforum.model');
const TagThread = require('../models/tagthread.model');
const MysqlQuery = require("../query/mysql.query");

// var startTime = performance.now();
// var endTime = performance.now();
// console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)

class subforum {

    static getTopByCategory(req, res){

        let datacache = getcache('topsubforumbycategory');

        if(datacache){

            console.log("Have subforum by category cache!!");
            let result = datacache;

            let listID = [];
            result.forEach(element => {
                listID.push(element.ID);
            });

            SubForum.getSavedByTop(listID ,req.query, function(error_code, SavedArray){
                if(error_code == 0){
                    console.log(SavedArray);
                    res.status(400).send('Status: Bad Request');
                }else{
                    for(let i = 0; i < result.length; i++){
                        let element = SavedArray[0].find(o => o.SubForum_ID === result[i].ID);
                        if(element){
                            result[i].Is_save = true;
                        }else{
                            result[i].Is_save = false;
                        }
                    }
                    res.status(200).send([result, SavedArray[1]]);
                }
            });

        }else{

            SubForum.getTopByCategory(req.query, function(error_code, result){
                if(error_code == 0){
                    console.log(result)
                    res.status(400).send('Status: Bad Request');
                }else{

                    console.log("Miss subforum by category cache!!");
                    setcache('topsubforumbycategory',result, 1000);
                    
                    let listID = [];
                    result.forEach(element => {
                        listID.push(element.ID);
                    });
    
                    SubForum.getSavedByTop(listID ,req.query, function(error_code, SavedArray){
                        if(error_code == 0){
                            console.log(SavedArray);
                            res.status(400).send('Status: Bad Request');
                        }else{
                            for(let i = 0; i < result.length; i++){
                                let element = SavedArray[0].find(o => o.SubForum_ID === result[i].ID);
                                if(element){
                                    result[i].Is_save = true;
                                }else{
                                    result[i].Is_save = false;
                                }
                            }
                            res.status(200).send([result, SavedArray[1]]);
                        }
                    });
                }
            });
        }

    }

    static getByCategory(req, res){
        SubForum.getByCategory(req.query, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getListSearchSubForum(req, res){
        SubForum.getListSearchSubForum(req.query, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static getByMember(req, res){
        SubForum.getByMember(req.query, function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result);
            }
        });
    }

    static insert(req, res){
        SubForum.insert( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send(result[1]);
            }
        });
    }

    static update(req, res){
        SubForum.update( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send('Status: Created');
            }
        });
    }

    static delete(req, res){
        SubForum.delete( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send('Status: Created');
            }
        });
    }

    static save(req, res){
        SubForum.save( req.body ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request');
            }else{
                res.status(200).send('Status: Created');
            }
        });
    }

    static loadInfoAddPost(req, res){
        let State = "SELECT SubForum.title as SubForumName, SubForum.ID as SubForum_ID , Category.title as CategoryName, Category.ID as Category_ID FROM SubForum LEFT JOIN  Category ON SubForum.Category_ID=Category.ID  WHERE SubForum.ID = "+req.query.subforum_id+" LIMIT 1; "
        MysqlQuery.select(State ,function(error_code, result){
            if(error_code == 0){
                console.log(result)
                res.status(400).send('Status: Bad Request')
            }else{
                TagThread.getall(function(error_code, result_){
                    if(error_code == 0){
                        res.status(400).send('Status: Bad Request')
                    }else{
                        res.status(200).send([result,result_])
                    }
                });
            }
        });
    }

}

module.exports = subforum;