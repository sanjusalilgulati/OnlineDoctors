const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const cards = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        cardName : String,
        cardNumber : String, //only last digit store
        expiry : String,
        status :  Number,
        tokenId  :  String,
        cardId :  String,
        fingerPrint : String,
        payment_method : Number // 0 for default or 1 for Un default
    },
    {
        timestamps: true 
    }
);
cards.plugin(mongoosePaginate);
module.exports = mongoose.model('cards', cards);