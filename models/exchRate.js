const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('app-config');

// Create an exchange rate model for when performing the CRUD operations
exchRateSchema = new Schema({
    rates: Array,
},
{
    timestamps: true // automatically manage createdAt and updatedAt properties 
},
{
    collection: config.app.COLLECTION_RATES // index/collection where to store the records
});
const ExchRate = mongoose.model(config.app.COLLECTION_RATES, exchRateSchema);
const Models = { ExchRate: ExchRate };
module.exports = Models;