const mongoose = require('mongoose');

const MangaSchema = mongoose.Schema({
    ID: { 
        required: true,
        unique : true,
        type: String,
    },
    Member_ID: {
        required: true,
        type: Number
    },
    title: {
        required: true,
        type: String
    },
    url_image: {
        required: true,
        type: String
    },
    intro: {
        required: true,
        type: String
    },
    author: {
        required: true,
        type: String
    },
    total_view: {
        type: Number,
        default: 0
    },
    time: {
        type: Date, 
        default: Date.now
    }
})



module.exports = mongoose.model('Manga', MangaSchema);