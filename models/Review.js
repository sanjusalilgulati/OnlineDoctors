const mongoose = require('mongoose');

const Review = mongoose.Schema({
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    doctorId : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    callId : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "calls"
    },
    user_review : String,
    status : String,
    feedback : String
},{
    timestamps : true
})

module.exports = mongoose.model('reviews', Review);