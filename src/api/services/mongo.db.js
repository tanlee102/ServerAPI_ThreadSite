const mongoose = require('mongoose');
const dbconfig = require('../../config/database.config');

mongoose.connect('mongodb://'+
                // dbconfig.mongodb.user+
                // ':'+dbconfig.mongodb.password+
                // '@'+
                dbconfig.mongodb.host+
                ':'+dbconfig.mongodb.port+
                '/'+dbconfig.mongodb.collection, 
                
                function(err) {
                    if (err) return console.error('error: ' + err.message);
                    console.log('Connected to the MONGODB server.');
                    
                }
    
                );

// mongoose.connect('mongodb://tan:1234@127.0.0.1:27017/Library', () =>{
//     console.log('connect to mongo successfull!!!');
// });

//mongodb://tan:1234@127.0.0.1:27017/Library'

console.log('Load Mongodb File.');