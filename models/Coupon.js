const mongoose = require('mongoose');

const PackageModel = mongoose.Schema({
    name : String,
    discount_percentage     : Number,
    code : String,
    country_code : String,
    country      : String,
    is_active    : Number,
    stripe_couponId : String
},{
    timestamps : true
})

module.exports = mongoose.model('package', PackageModel);