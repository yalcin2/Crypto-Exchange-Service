const ExchRateService = require('../services/exchRate');

const exchangeRates = {
  getRatesAPI: function(req, res){
    ExchRateService.getRatesAPI().then(data => {
      res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: "Error occurred while retrieving Exchange Rates."
        });
    })
  }
}

module.exports = exchangeRates;