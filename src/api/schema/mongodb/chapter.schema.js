const mongoose = require('mongoose');

const MangaSchema = mongoose.Schema({
    ID: { 
        required: true,
        unique : true,
        type: String,
    },
    ID_Manga: {
        required: true,
        type: String
    },
    Number_chap: { 
        required: true,
        type: Number,
    },
    Member_ID: {
        required: true,
        type: Number
    },
    title: {
        type: String
    },
    content: {
        required: true,
        type: [String] 
    },
    time: {
        type: Date, 
        default: Date.now
    }
})



module.exports = mongoose.model('Chapter', MangaSchema);