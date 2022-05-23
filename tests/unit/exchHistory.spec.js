const proxyquire = require("proxyquire")
const chai = require("chai");
const sinon = require("sinon");
const request = require('supertest');
var sinonChai = require("sinon-chai");

const expect = chai.expect;
chai.use(sinonChai);

describe("Exchange History Routes", () => {
  let exchangeHistories;
  let exchHistoryModel;
  let ExchHistory;
  let config;

  let fakeExchangeHistoryRecord;
  let exchangeHistoryModel;

  beforeEach(() => {
    fakeExchangeHistoryRecord = {
      currencyFrom: "USD",
      amount1: 1,
      currencyTo: "EUR",
      amount2: 1.04,
      type: "Exchanged",
    }

    res = {
      send: sinon.stub()
    }

    exchangeHistoryModel = class ExchHistoryModel {
      constructor(data) {
        this.data = data;

        if(typeof data.amount1 !== "number" || 
          typeof data.amount2 !== "number" || 
          typeof data.currencyFrom !== "string" || 
          typeof data.currencyTo !== "string"){
            throw new Error("ERROR! Invalid data types!"); // Mongoose should throw an error if the data types do not match.
        }
      }

      
      save = function() {
        return new Promise(resolve=>{
          resolve({
            currencyFrom: this.data.currencyFrom,
            amount1: this.data.amount1,
            currencyTo: this.data.currencyTo,
            amount2: this.data.amount2,
            type: this.data.type
          })
        });
      }
    }

    exchangeHistoryModel.find = sinon.stub().returns(Promise.resolve(fakeExchangeHistoryRecord));
    
    exchHistoryModel = {
      ExchHistory: exchangeHistoryModel
    }

    config = {
      app: {
        FIAT: ["usd", "eur", "gbp"]
      }
    }

    exchangeHistories = proxyquire(process.cwd() + "/services/exchHistory", {
      '../models/exchHistory': exchHistoryModel,
      'app-config': config
    })

  });

  describe("getExchangeHistory", () => { 
    it("should return a correct exchange histories object.", () => {
      
      return exchangeHistories.getExchangeHistory().then((res) => {
        expect(exchangeHistoryModel.find).calledWith({});
        expect(exchangeHistoryModel.find).callCount(1);
        expect(res).deep.equal({
          currencyFrom: 'USD',
          amount1: 1,
          currencyTo: 'EUR',
          amount2: 1.04,
          type: 'Exchanged'
        })
        expect(typeof res).eql("object")
      });
    });

    it("should return a message if failed to get the exchange histories.", () => {
      let error = new Error("Error occurred while retrieving Exchange Histories.");
      exchangeHistoryModel.find = sinon.stub().returns(Promise.reject(error))

      return exchangeHistories.getExchangeHistory().catch((err) => {
        expect(exchangeHistoryModel.find).calledWith({});
        expect(exchangeHistoryModel.find).callCount(1);
        expect(err).eql(error.message);
        expect(typeof err).eql("string")
      });
    });
  });

  describe("addExchangeHistory", () => { 
    it("should save an exchange history object with 'Live Price' type object.", () => {

      return exchangeHistories.addExchangeHistory(fakeExchangeHistoryRecord).then((res) => {
        expect(res).deep.equal({
          currencyFrom: 'USD',
          amount1: 1,
          currencyTo: 'EUR',
          amount2: 1.04,
          type: 'Live Price'
        })
        expect(typeof res).eql("object")
      });
    });

    it("should save an exchange history object with 'Exchanged' type object.", () => {
      fakeExchangeHistoryRecord.currencyFrom = "ETH";
      fakeExchangeHistoryRecord.currencyTo = "ADA";

      return exchangeHistories.addExchangeHistory(fakeExchangeHistoryRecord).then((res) => {
        expect(res).deep.equal({
          currencyFrom: 'ETH',
          amount1: 1,
          currencyTo: 'ADA',
          amount2: 1.04,
          type: 'Exchanged'
        })
        expect(typeof res).eql("object")
      });
    });

    it("should return an error if failed to get the exchange histories.", () => {
      let badExchangeHistoryRecord = {
        currencyFrom: "USD",
        amount1: "1", // <-- invalid type
        currencyTo: "EUR",
        amount2: 1.04,
        type: "Exchanged",
      }

      return exchangeHistories.addExchangeHistory(badExchangeHistoryRecord).catch((err) => {
        expect(err.message).eql("ERROR! Invalid data types!");
      });
    });

    it("should return a message if the exchange histories amount is undefined or null.", () => {
      let badExchangeHistoryRecord = {
        currencyFrom: "USD",
        amount1: null, // <-- invalid type
        currencyTo: "EUR",
        amount2: 1.04,
        type: "Exchanged",
      }

      return exchangeHistories.addExchangeHistory(badExchangeHistoryRecord).catch((err) => {
        expect(err.message).eql("Error: Amounts inputted are incorrect!");
      });
    });
    
  });
});