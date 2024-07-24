const mongoose = require('mongoose');

const SubscriptionModel = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    package_id : { type: mongoose.Schema.Types.ObjectId, ref: 'packages' },
    booking_date : Date,
    expiry_date  : Date,
    base_price  : Number,
    tax    : Number,
    tax_amount : Number,
    amount_subtotal : Number,
    amount_total : Number,
    coupon_code : String,
    discount : Number,
    is_discount : Number,
    payment_id : String,
    payment_intent : String,
    payment_status : String,
    payment_mode   : String,
    tenure      : String,
    country_code : String,
    country      : String,
    subscriptionId : String,
    invoice      : String,
    payment_result : Object,
    is_active      : Boolean,
    status         : Number, // we can maintain status if 0 is Pending and 1 is Active 2 for update and 3 for cancel.
    subscription_type : Number, //Type 1 for normal subscription and 2 for dependent subscription
    dependentId : { type: mongoose.Schema.Types.ObjectId, ref: 'user_depedent' },
    cancelAt : Date
},{
    timestamps : true
})

module.exports = mongoose.model('subscription', SubscriptionModel);