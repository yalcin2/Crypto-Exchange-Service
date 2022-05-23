const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('app-config');

// Create an exchange history model for when performing the CRUD operations
exchHistorySchema = new Schema({
    currencyFrom: String,
    amount1: Number,
    currencyTo: String,
    amount2: Number,
    type: String,
},
{
    timestamps: true // automatically manage createdAt and updatedAt properties 
},
{
    collection: config.app.COLLECTION_HISTORIES // index/collection where to store the records
});
const ExchHistory = mongoose.model(config.app.COLLECTION_HISTORIES, exchHistorySchema);
const Models = { ExchHistory: ExchHistory };
module.exports = Models;