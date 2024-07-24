const mongoose = require('mongoose');

const PackageModel = mongoose.Schema({
    name : String,
    description : String,
    price  : Number,
    tax    : Number,
    country_code : String,
    country      : String,
    discount     : Number,
    month_stripe_priceId    : String,
    annual_stripe_priceId    : String,
    package_type : Number, // 1 for app subscription package & 2 for dependency subscription package
    stripe_productId  : String
},{
    timestamps : true
})

module.exports = mongoose.model('packages', PackageModel);