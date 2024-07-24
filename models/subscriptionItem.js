const mongoose = require('mongoose');

const SubscriptionItemModel = mongoose.Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    package_id : { type: mongoose.Schema.Types.ObjectId, ref: 'packages' },
    subscription_id : { type: mongoose.Schema.Types.ObjectId, ref: 'subscription' },
    invoice : String,
    payment_status     : String,
    payment_subscription : String,
    request_id    : String,
    amount_total : Number,
    coupon_code : String,
    discount : Number,
    is_discount : Number,
    tenure      : String,
    country_code : String,
    country      : String,
    status         : Number, // we can maintain status if 0 is Pending and 1 is Active 2 for update and 3 for cancel.
    is_active    : Boolean
},{
    billing_date : Date,
    timestamps : true
})

module.exports = mongoose.model('subscription_item', SubscriptionItemModel);