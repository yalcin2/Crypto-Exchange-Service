const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
const request = require('supertest');
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Exchange Rates Routes", () => {
  let exchangeRates;
  let exchRatesModel;
  let ExchRates;
  let config;

  let CoinGecko;
  let fakeRawRates;

  let fakeExchangeRatesRecord;
  let exchangeRatesModel;
  let fakeRates;
  let isDefinedExchRatesModel = false;
  let saveCallCount = 0;

  beforeEach(() => {
    fakeRates = {
      BTC: 0.00003320004841895062,
      ETH: 0.0004989303276399899,
      LTC: 0.014064669311913726,
      XRP: 2.3894305255454786,
      USD: 1,
      EUR: 0.9440229919631316,
      GBP: 0.8003809904756366
    }

    fakeExchangeRatesRecord = [{
        _id: "6286cc97f6e3e1b881d03fcd",
        rates: [ fakeRates ],
        createdAt: "2022-05-19T23:02:47.604Z",
        updatedAt: "2022-05-19T23:02:47.604Z",
        __v: 0
      }]

    fakeRawRates = {"data":{"rates":{"btc":{"name":"Bitcoin","unit":"BTC","value":1,"type":"crypto"},"eth":{"name":"Ether","unit":"ETH","value":14.883,"type":"crypto"},"ltc":{"name":"Litecoin","unit":"LTC","value":423.861,"type":"crypto"},"bch":{"name":"Bitcoin Cash","unit":"BCH","value":152.127,"type":"crypto"},"bnb":{"name":"Binance Coin","unit":"BNB","value":96.35,"type":"crypto"},"eos":{"name":"EOS","unit":"EOS","value":22803.198,"type":"crypto"},"xrp":{"name":"XRP","unit":"XRP","value":70609.355,"type":"crypto"},"xlm":{"name":"Lumens","unit":"XLM","value":229512.884,"type":"crypto"},"link":{"name":"Chainlink","unit":"LINK","value":4216.548,"type":"crypto"},"dot":{"name":"Polkadot","unit":"DOT","value":3002.19,"type":"crypto"},"yfi":{"name":"Yearn.finance","unit":"YFI","value":3.157,"type":"crypto"},"usd":{"name":"US Dollar","unit":"$","value":29387.416,"type":"fiat"},"aed":{"name":"United Arab Emirates Dirham","unit":"DH","value":107939.98,"type":"fiat"},"ars":{"name":"Argentine Peso","unit":"$","value":3480749.88,"type":"fiat"},"aud":{"name":"Australian Dollar","unit":"A$","value":41762.457,"type":"fiat"},"bdt":{"name":"Bangladeshi Taka","unit":"৳","value":2572753.47,"type":"fiat"},"bhd":{"name":"Bahraini Dinar","unit":"BD","value":11078.938,"type":"fiat"},"bmd":{"name":"Bermudian Dollar","unit":"$","value":29387.416,"type":"fiat"},"brl":{"name":"Brazil Real","unit":"R$","value":143460.551,"type":"fiat"},"cad":{"name":"Canadian Dollar","unit":"CA$","value":37732.267,"type":"fiat"},"chf":{"name":"Swiss Franc","unit":"Fr.","value":28651.026,"type":"fiat"},"clp":{"name":"Chilean Peso","unit":"CLP$","value":24582573.925,"type":"fiat"},"cny":{"name":"Chinese Yuan","unit":"¥","value":196689.978,"type":"fiat"},"czk":{"name":"Czech Koruna","unit":"Kč","value":685267.533,"type":"fiat"},"dkk":{"name":"Danish Krone","unit":"kr.","value":206946.921,"type":"fiat"},"eur":{"name":"Euro","unit":"€","value":27813.984,"type":"fiat"},"gbp":{"name":"British Pound Sterling","unit":"£","value":23531.591,"type":"fiat"},"hkd":{"name":"Hong Kong Dollar","unit":"HK$","value":230619.22,"type":"fiat"},"huf":{"name":"Hungarian Forint","unit":"Ft","value":10696972.625,"type":"fiat"},"idr":{"name":"Indonesian Rupiah","unit":"Rp","value":431185221.896,"type":"fiat"},"ils":{"name":"Israeli New Shekel","unit":"₪","value":98767.874,"type":"fiat"}}}, "code": 200}

    res = {
      send: sinon.stub()
    }

    exchangeRatesModel = class ExchRatesModel {
      constructor(data) {
        this.data = data;
      }
      
      save = function() {
        isDefinedExchRatesModel = true;
        saveCallCount++;
        return new Promise(resolve=>{
          resolve(this.data)
        });
      }
    }

    CoinGecko = class ModelCoinGecko {
        constructor() {
        }

        exchangeRates = {
            all: sinon.stub().returns(Promise.resolve(fakeRawRates))
        }
    }
  
    exchangeRatesModel.find = sinon.stub().returns({
      limit: sinon.stub().returns({
        sort: sinon.stub().returns(Promise.resolve(fakeExchangeRatesRecord))
      })
    });
    
    exchRatesModel = {
      ExchRate: exchangeRatesModel
    }

    config = {
      app: {
        CURRENCIES: ["btc", "eth", "ltc", "xrp", "usd", "eur", "gbp"]
      }
    }

    exchangeRates = proxyquire(process.cwd() + "/services/exchRate", {
      'coingecko-api': CoinGecko,
      '../models/exchRate': exchRatesModel,
      'app-config': config
    })

  });

  describe("getRatesAPI", () => { 
    it("should return a correct exchange rates array from the database.", () => {
      
      return exchangeRates.getRatesAPI().then((res) => {
        expect(exchangeRatesModel.find).callCount(1);
        expect(res).eql([{
          _id: "6286cc97f6e3e1b881d03fcd",
          rates: [ fakeRates ],
          createdAt: "2022-05-19T23:02:47.604Z",
          updatedAt: "2022-05-19T23:02:47.604Z",
          __v: 0
        }])
        expect(typeof res).eql("object")
      });
    });

    it("should return an error if failed to get exchange rates.", () => {
      let error = new Error("Error occurred while retrieving Exchange Rates.");
      exchangeRatesModel.find = sinon.stub().returns({
        limit: sinon.stub().returns({
          sort: sinon.stub().returns(Promise.reject(error))
        })
      });

      return exchangeRates.getRatesAPI().catch((err) => {
        console.log(err)
        expect(exchangeRatesModel.find).callCount(1);
        expect(err).eql(error.message);
        expect(typeof err).eql("string")
      });
    });
  });

  describe("getLiveRates", () => { 
    it("should get all the live rates and return only the required currencies only as an array", () => {
      
      return exchangeRates.getLiveRates().then((res) => {     
        expect(res).eql([
          {
            BTC: 0.0000340281704250554,
            ETH: 0.0005064412604360995,
            LTC: 0.014423214344534408,
            XRP: 2.4027071655432377,
            USD: 1,
            EUR: 0.9464589877517641,
            GBP: 0.8007369889206999
          }
        ])
        expect(typeof res).eql("object")
      });
    });

    it("should return the rest of the required rates even if some currencies (other then the BTC/USD) isn't found", () => {
      fakeRawRates.data.rates.eth = null;
      fakeRawRates.data.rates.ltc = null;
      fakeRawRates.data.rates.gbp = null;

      return exchangeRates.getLiveRates().then((res) => {     
        expect(res).eql([
          {
            BTC: 0.0000340281704250554,
            XRP: 2.4027071655432377,
            USD: 1,
            EUR: 0.9464589877517641
          }
        ])
        expect(typeof res).eql("object")
      });
    });

    it("should return an error message if the response code is not 200", () => {
      fakeRawRates.code = 400

      return exchangeRates.getLiveRates().catch((res) => {     
        expect(res).eql("Error occurred while retrieving the live exchange rates.")
        expect(typeof res).eql("string")
      });
    });

    it("should return an error message if the USD currency isn't found", () => {
      fakeRawRates.data.rates.usd = null

      return exchangeRates.getLiveRates().catch((res) => {    
        expect(res).eql("Error occurred while retrieving the live exchange rates.")
        expect(typeof res).eql("string")
      });
    });

    it("should return an error message if the BTC crypto isn't found", () => {
      fakeRawRates.data.rates.btc = null

      return exchangeRates.getLiveRates().catch((res) => {    
        expect(res).eql("Error occurred while retrieving the live exchange rates.")
        expect(typeof res).eql("string")
      });
    });
  });

  describe("saveLiveRatesUpdate", () => { 
    it("should save the live rates every (x) interval", function(done) {
      
      exchangeRates.saveLiveRatesUpdate(10);

      setTimeout(function () {
        expect(isDefinedExchRatesModel).eql(true);
        expect(saveCallCount).greaterThan(5);
        done();
      }, 300);
    });
  });

});