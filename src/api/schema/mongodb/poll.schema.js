const mongoose = require('mongoose');

const PollSchema = mongoose.Schema({
    poll_id: {
        required: true,
        type: String,
        unique: true
    },
    id_user: {
        required: true,
        type: Number
    },
    title: {
        required: true,
        type: String
    },
    tags: [{
        type: String
    }],
    items: [
        {
            _id: false,
            id: Number,
            url: String,
            label: String,
            votes: {
                type: Number, 
                default: 0,
            },
        },
    ],
    time: {
        type: Date, 
        default: Date.now
    }
})

module.exports = mongoose.model('Poll', PollSchema);