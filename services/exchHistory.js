const config = require('app-config');

const ExchHistoryModel = require('../models/exchHistory');
const ExchHistory = ExchHistoryModel.ExchHistory;

const fiatCurrencies = config.app.FIAT;

function getExchangeHistory(){
    return new Promise((resolve, reject) => {
        // Get all the exchange histories
        ExchHistory.find({}).then(data => {
            resolve(data);
        }).catch(err => {
            // future improvment: implement online error reporting
            reject("Error occurred while retrieving Exchange Histories.");
        })
    })
}

function addExchangeHistory(data){
    return new Promise((resolve, reject) => {
        // Check the type of transaction that is being performed with the request data
        let type = (fiatCurrencies.includes(data.currencyFrom.toLowerCase())) ? "Live Price" :
                   (fiatCurrencies.includes(data.currencyTo.toLowerCase())) ? "Live Price" : "Exchanged";


        // Do some minor validation on the data before saving it to 'MongoDB'
        if(data.amount1 === null || data.amount2 === null ||
           typeof data.amount1 === "undefined" || typeof data.amount2 === "undefined" ){
            throw new Error("Error: Amounts inputted are incorrect!");
        }

        // Insert the data into a model
        const exchHistory = new ExchHistory({
                    currencyFrom: data.currencyFrom,
                    amount1: data.amount1,
                    currencyTo: data.currencyTo,
                    amount2: data.amount2,
                    type
                });

        // Save the modeled data
        exchHistory.save().then(data => {
            resolve(data);
        }).catch(err => {
            console.log(err)
            // future improvment: implement online error reporting
            reject( "Error occurred while creating the Exchange History.");
        })
    })
}

// Export the functionalities
module.exports = {
    getExchangeHistory: getExchangeHistory,
    addExchangeHistory: addExchangeHistory
}