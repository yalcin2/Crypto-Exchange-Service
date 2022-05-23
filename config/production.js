module.exports = {
    ATLAS_URI: process.env.ATLAS_URI,
    PUSHER: {
        appId: process.env.appId,
        key: process.env.key,
        secret: process.env.secret,
        cluster: process.env.cluster,
        useTLS: process.env.useTLS,
        channel: process.env.channel
      },
    COLLECTION_HISTORIES: process.env.COLLECTION_HISTORIES,
    COLLECTION_RATES: process.env.COLLECTION_RATES,
    CURRENCIES: process.env.CURRENCIES,
    FIAT: process.env.FIAT,
}; 