// Import modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
const bodyParser = require('body-parser');
const config = require('app-config');
const helmet = require("helmet");
const mongoose = require('mongoose');
const Pusher = require('pusher');

var indexRouter = require('./routes/index');
var currencyRates = require('./services/exchRate');

// Initialize pusher notification app with the configurables
const pusher = new Pusher({
  appId      : config.app.PUSHER.appId,
  key        : config.app.PUSHER.key,
  secret     : config.app.PUSHER.secret,
  cluster    : config.app.PUSHER.cluster,
  encrypted  : config.app.PUSHER.useTLS,
});

const channel = config.app.PUSHER.channel

// DB connection
mongoose.connect(config.app.ATLAS_URI)
  .then(()=> console.log('DB connected successfully.')
  ).catch(err => console.log('DB connection failed ' + err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection Error:'));

db.once('open', () => {
  // Attach a listener to the MongoDB collection to listen for changes
  const taskCollection_HISTORIES = db.collection(config.app.COLLECTION_HISTORIES);
  const taskCollection_RATES = db.collection(config.app.COLLECTION_RATES);
  const changeStream_HISTORIES = taskCollection_HISTORIES.watch();
  const changeStream_RATES = taskCollection_RATES.watch();

  // Send a pusher notification to the React-App with the exchange histories
  changeStream_HISTORIES.on('change', (change) => {
    const task = change.fullDocument;
    pusher.trigger(
      channel,
      'inserted_histories', 
      {
        id: task._id,
        currencyFrom: task.currencyFrom,
        amount1: task.amount1,
        currencyTo: task.currencyTo,
        amount2:task.amount2,
        createdAt: task.createdAt,
        type: task.type
      }
    ); 
  });
  
  // Send a pusher notification to the React-App with the exchange rates
  changeStream_RATES.on('change', (change) => {
    const task = change.fullDocument;
    pusher.trigger(
      channel,
      'inserted_rates', 
      {
        rates: task.rates,
      }
    ); 
  });
});

// Send the currency rates every few seconds to the React-App via web-sockets (pusher)
currencyRates.saveLiveRatesUpdate(20000);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
// Adds additional security to protect the HTTP headers in response.
app.use(helmet());
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


