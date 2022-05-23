const express = require('express');
const router = express.Router();
const exchHistory = require('../controllers/exchHistory');
const exchRates = require('../controllers/exchRate');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Attach the routes with their respective functionality
router.get(`/exchange-rates`, [exchRates.getRatesAPI]);
router.get(`/exchange-history`, [exchHistory.getExchangeHistory]);
router.post(`/exchange-history`, [exchHistory.addExchangeHistory]);

module.exports = router;
