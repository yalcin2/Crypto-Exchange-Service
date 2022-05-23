const ExchHistoryService = require('../services/exchHistory');

const exchangeHistories = {
    // GET get all Exchange Histories
    getExchangeHistory: function(req, res) {
        ExchHistoryService.getExchangeHistory().then((result) =>{
            res.send(result);
        }).catch(err => {
            res.status(500).send({
                message: err
            });
        })
    },
    // POST add new Exchange History
    addExchangeHistory: function(req, res) {
        let data = req.body;

        ExchHistoryService.addExchangeHistory(data).then((result) =>{
            res.send(result);
        }).catch(err => {
            res.status(500).send({
                message: err
            });
        })
    },
}
module.exports = exchangeHistories;