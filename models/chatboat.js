const mongoose = require('mongoose');

const chatboat = mongoose.Schema({
    form : {type : String, default: null},
    status : String,
    /**
     *  Status  Active,
     *  Status  Complete
     */
    ip     : {type : String, default: null},
    createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('chatboats', chatboat);