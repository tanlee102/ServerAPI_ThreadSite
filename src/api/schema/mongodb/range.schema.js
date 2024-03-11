const mongoose = require('mongoose');

const RangeSchema = mongoose.Schema({
    id_user: {
        required: true,
        type: Number
    },
    range_number: {
        required: true,
        type: Number
    },
    start: {
        required: true,
        type: String
    },
    end: {
        required: true,
        type: String
    }
})

module.exports = mongoose.model('Range', RangeSchema);