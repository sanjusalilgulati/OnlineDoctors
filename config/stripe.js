const stripe = require('stripe')(process.env.STRIPE_KEY);

/**
 * 
 * @param {Data return JSON where name, email and phone coming} data 
 * Create a User record on the stripe gateway
 * @returns 
 */

const addCustomer = async (data) => {
    const customer = await stripe.customers.create({
        name : data.name,
        email : data.email,
        phone : data.phone
    })

    if(customer)
    {
        return customer;
    }else{
        return {
            error : "No Data Found"
        }
    }
}

/**
 * 
 * @param {Data like card details} data 
 * Add user card for payment 
 * @returns 
 */

const generateToken = async (data) => {
    const token = await stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: '5',
          exp_year: '2024',
          cvc: '314',
        },
      });
    if(token)
    {
        return token;
    }else{
        return {
            error : "No Data Found"
        }
    }
}
/**
 * 
 * @param { Stripe customer ID} customerId 
 * @param { Generate Token } token 
 * When you create a new credit card, you must specify a customer or recipient on which to create it.
 * @returns 
 */
const createSource = async (customerId, token) => {
    const customerSource = {};
    return customerSource;
}

/**
 * 
 * @param {getCustomerId and same customer set payment} customerId 
 * @param {cardId setup card} cardId 
 */

const defaultSource = async (customerId, cardId) => {
    try{
        const defaultCard = await stripe.customers.update(
            customerId,
            {
                invoice_settings : {
                    default_payment_method : cardId
                }
            }
          );
          return defaultCard;
    }catch(err)
    {
        return {
            error : "No Data Found"
        }
    }
}

/**
 * 
 * @param {Product Price} amount 
 * @param {INR, INR} currency 
 * @param {Product name} productName 
 * Products describe the specific goods or services you offer to your customers
 * @returns 
 */

const addProduct = async (amount, currency, productName) => {
    const price = {};

    return price;
}

/**
 * 
 * @param {Stripe Customer ID} customerId 
 * @param { Price of the package} priceId 
 * @param { If year package then default coupon code applied} couponCode 
 * @param { Base url when payment done the get success or failure} baseUrl 
 * Subscriptions allow you to charge a customer on a recurring basis.
 * @returns 
 */

const addSubscription = async (customerId, priceId, couponCode, baseUrl) => {
    // source  : 'pm_1OytxjP8gJ5biOUwmXJxvlDB',
    let thirtyMinutes = 30 * 60 * 1000; // URL will be expires after 30 mins
    const date = new Date(new Date().getTime() + thirtyMinutes);
    try{
        if(couponCode){
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                customer: customerId,
                line_items: [
                  {
                    price: priceId,
                    // For metered billing, do not pass quantity
                    quantity: 1 
                  },
                ],
                discounts: [
                    {
                      coupon: couponCode,
                    },
                ],
                expires_at : date,
                success_url: `${baseUrl}success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}cancel`
            });
            return session;
        }else{
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                customer: customerId,
                line_items: [
                  {
                    price: priceId,
                    // For metered billing, do not pass quantity
                    quantity: 1 
                  },
                ],
                expires_at : date,
                success_url: `${baseUrl}success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url:  `${baseUrl}cancel`
            });
            return session;
        }
    }catch (error)
    {
        return error;
    }
}

/**
 * 
 * @param {Which subscription you want cancel that subscription ID} subscriptionId 
 * Cancels a customer’s subscription immediately. The customer will not be charged again for the subscription.
 * @returns 
 */

const cancelSubscription = async (subscriptionId) => {
    console.log(subscriptionId);
    try{
        const cancelSubscription = await stripe.subscriptions.cancel(subscriptionId);
        //   console.log(cancelSubscription);
          return cancelSubscription;
    }catch (error)
    {
        return error
    }
}

const getStripeSubscription = async (subscriptionId) => {
    console.log(subscriptionId);
    try{
        const getSub = await stripe.subscriptions.retrieve(
            subscriptionId
        );
        return getSub;
    }catch (error)
    {
        return error;
    }
}

const updateStripeSubscription = async (subscriptionId, couponCode, price, itemId) => {
    try {
        const upgradeSub = await stripe.subscriptions.update(
            subscriptionId,
            {
                items : [{
                    id : itemId,
                    price : price
                }],
                coupon : couponCode,
                proration_behavior : 'always_invoice'
            }
        )
        return upgradeSub;
    }catch (error)
    {
        return error;
    }
}

module.exports = {
    addCustomer,
    generateToken,
    createSource,
    addProduct,
    addSubscription,
    cancelSubscription,
    defaultSource,
    getStripeSubscription,
    updateStripeSubscription
}

