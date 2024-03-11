const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    id: {
        required: true,
        type: Number
    },
})

module.exports = mongoose.model('Book', BookSchema);