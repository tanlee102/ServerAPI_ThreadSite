const mongoose = require('mongoose');

const WordSchema = mongoose.Schema({
    label: {
        required: true,
        type: String
    },
    words: [
        
            String,
  
    ],
    
})

module.exports = mongoose.model('Word', WordSchema);