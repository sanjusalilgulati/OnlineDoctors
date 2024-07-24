const express = require('express');
const userSubscription = require('../models/subscription');
const { addSubscriptionItem } = require('../config/common');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const router = express.Router();

/**
 *   Payment gateway webhook calls
 * 
 */
router.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    console.log('here');
});

module.exports = router