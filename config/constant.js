'use strict';

const  getCurrecy = (country) => {
    switch(country){
        case 'Canada': 
            return {
                currency : "CAD"
            }
        break;
        case 'India':
            return {
                currency : "INR"
            }
        break;
        case 'Kazakhstan':
            return {
                currency : "KZT"
            }
        break;
        case 'Russia':
            return {
                currency : "RUB"
            }
        break;
        case 'Tajikistan':
            return {
                currency : "inr"
            }
        break;
        case 'United States':
            return {
                currency : "USD"
            }
        break;
        case 'United Arab Emirates':
            return {
                currency : "AED"
            }
        break;
        case 'Saudi Arabia':
            return {
                currency : "SAR"
            }
        break;
        default :
            return {
                currency : "CAD"
            }
        break;
    }
}
     
module.exports = {
    getCurrecy
};