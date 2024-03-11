const mongoose = require('mongoose');

const ReadedSchema = mongoose.Schema({
    id_user: {
        required: true,
        type: Number
    },
    posts: [
        {
        id_post: Number,
        time: Date
        },
    ],
})

module.exports = mongoose.model('Readed', ReadedSchema);