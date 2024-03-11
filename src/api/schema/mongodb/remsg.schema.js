const mongoose = require('mongoose');

const ReMsgSchema = mongoose.Schema({
    MemberMsg_ID: {
        required: true,
        type: Number
    },
    MemberWall_ID: {
        required: true,
        type: Number
    },
    ID_: { 
        required: true,
        type: Number,
    },
    Member_ID: {
        required: true,
        type: Number
    },
    text: {
        required: true,
        type: String
    },
    time: {
        type: Date, 
        default: Date.now
    }
})

module.exports = mongoose.model('ReMsg', ReMsgSchema);