const mongoose = require('mongoose');

const MsgSchema = mongoose.Schema({
    ID: { 
        required: true,
        unique : true,
        type: Number,
    },
    MemberWall_ID: {
        required: true,
        type: Number
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



module.exports = mongoose.model('Msg', MsgSchema);