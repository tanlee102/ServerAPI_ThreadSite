const mongoose = require('mongoose');

const UserTokenSchema = mongoose.Schema({
    id_user: { 
        required: true,
        type: Number,
    },
    refresh_token: {
        required: true,
        type: String
    },
    device: {
        required: true,
        type: String
    },
    time: {
        required: true,
        type: Date
    }
})

module.exports = mongoose.model('UserToken', UserTokenSchema);