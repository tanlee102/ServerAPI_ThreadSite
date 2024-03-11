const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    id_post: {
        required: true,
        type: Number
    },
    content: {
        required: true,
        type: String
    },
    label_content: {
        required: true,
        type: String
    },
    name_user_reply: {
        required: false,
        type: String
    }
})

module.exports = mongoose.model('Post', PostSchema);