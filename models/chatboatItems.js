const mongoose = require('mongoose');

const chatboat = mongoose.Schema({
    chatId : { type: mongoose.Schema.Types.ObjectId, ref: 'chatboats' },
    form  : {type : String, default: null},
    current_stage : String,
    next_stage    : String,
    current_stage_index : Number,
    next_stage_index    : Number,
    text          : String,
    status : String,
     /**
     *  Status  Active,
     *  Status  Complete
     */
    type_id : Number, // 1 for question and 2  for answer
    options : Object,
    createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('chatboat_items', chatboat);