const config = require('app-config');
const CoinGecko = require('coingecko-api');

const ExchRateModel = require('../models/exchRate');
const ExchRate = ExchRateModel.ExchRate;
const currencies = config.app.CURRENCIES

function processCurrencies(rates){
    let dataToSend = {};
    let btcPrice = rates["usd"].value; 
    rates["btc"].value = btcPrice;

    for(rate in rates){
      if(currencies.includes(rate.toLowerCase())){
        // All prices are compared to bitcoin for this specific API (coingecko) so convert the rates to be based on the USD instead.
        if(rate === "usd") // We are comparing all currencies to the USD, so it should be equal to 1
          dataToSend[rate.toUpperCase()] = 1
        else if(["btc"].includes(rate)) // Convert the rate for the BTC to be valued at 1 USD
          dataToSend[rate.toUpperCase()] = 1 / rates[rate].value
        else if(rates[rate]) {
          // Convert the rates from versus BTC, to versus USD instead.
          let usdPrice = btcPrice / rates[rate].value;
          let basePrice = 1 / usdPrice;
          dataToSend[rate.toUpperCase()] = basePrice
        }      
      }
    }

    return [dataToSend];
}


// Gets the live rates with the 'Coingecko' API
function getLiveRates(){
    return new Promise((resolve, reject) => { 
      const CoinGeckoClient = new CoinGecko();

      var getRates = async() => {
        try{
          // Get all the crypto/fiat currencies rates (compared with BTC)
          let response = await CoinGeckoClient.exchangeRates.all();

          if(response.code !== 200)
              reject("Error occurred while retrieving the live exchange rates.");
          else{
            // Process the currencies, as we should have the correct rates and only the specified FIAT/CRYPTO in the configuration.
            let rates = processCurrencies(response.data.rates);
            resolve(rates);
          }
        }
        catch(err){
          console.log(err);
          reject("Error occurred while retrieving the live exchange rates.");
        }
      };
      getRates();
    });
}

// Returns the latest exchange rates record
function getRatesAPI(){
    return new Promise((resolve, reject) => {
        ExchRate.find().limit(1).sort({$natural:-1}).then(data => {
            resolve(data);
        }).catch(err => {
            reject("Error occurred while retrieving Exchange Rates.");
        })
    })
}

function saveLiveRatesUpdate(time){
    // This functionality will wait for (x) amount of time and save the live rates to MongoDB.
    setInterval(function() {
        getLiveRates().then((rates => {
            if(rates){
              const exchRate = new ExchRate({
                  rates: rates
              });
    
              exchRate.save().catch(err => {
                console.log("Error occurred while saving the Exchange Rate.");
              });
            }
        }));
    }, time);
}   

// Export functions so they can be used in other scripts
module.exports = {
    processCurrencies: processCurrencies,
    getLiveRates: getLiveRates,
    getRatesAPI: getRatesAPI,
    saveLiveRatesUpdate: saveLiveRatesUpdate
}