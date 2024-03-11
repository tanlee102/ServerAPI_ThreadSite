const Book = require('../models/book.model');
const Home = require('../models/home.model');

const M_Book = require('../schema/mongodb/book.schema');

exports.home = async function(req, res){

    const m_book = new M_Book({
        title: req.params.title,
        id: req.params.id,
    })

    m_book.save().then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(err);
    })

    M_Book.find().exec(function(err, users){
        console.log('users : ', users);
        console.log('err', err);
       });

    Book.getall(function(result){
        res.send(result);
    });

    const book = new Book(req.params.id, req.params.title);
    Book.addall(book);
    
}