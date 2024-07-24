const express = require('express');
const Packages = require('../models/Packages');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const router = express.Router();
const {getCurrecy} = require('../config/constant');
const subscription = require('../models/subscription');
const { addCustomer, createSource, addProduct, addSubscription, defaultSource, getStripeSubscription, updateStripeSubscription } = require('../config/stripe');
const User = require('../models/User');
const { addSubscriptionItem, getSubscription } = require('../config/common');
const userDepedent = require('../models/userDependent');
const cards = require('../models/cards');
const subscriptionItem = require('../models/subscriptionItem');

router.post('/create', async (req, res) => {
    const data = [];
    res.status(200).json({message : res.__('PAYMENT'), resp : data});
});

router.post('/update', async (req, res) => {
    const { subscriptionId,  packageId, coupon_code, tenure, is_discount } = req.body;
    const data = [];
    res.send({message : "Update sucessfully", data});
})

router.post('/retrieve', async (req, res) => {
    const {payment_id, id} = req.body;
    const updateSubscription = [];
    res.status(200).json({message : res.__('SUBSCRIPTION_ADDED'), resp : updateSubscription})
});

router.post('/add-card', async (req, res) => {
    const {card, cvv, expiry, name}  = req.body;
    const cardData = [];
    return res.status(200).json({message : "card save sucessfully", cardData});
});
module.exports = router