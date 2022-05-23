module.exports = {
    ATLAS_URI: "mongodb+srv://fullstackapp:fullstackapp@fullstackapp.dhyw3.mongodb.net/test",
    PUSHER: {
        appId: "1407664",
        key: "8944e495602f20cbcfde",
        secret: "fdb54e87912771f977a0",
        cluster: "eu",
        useTLS: true,
        channel: "fullstack-app",
      },
    COLLECTION_HISTORIES: "crypto_histories",
    COLLECTION_RATES: "crypto_rates",
    CURRENCIES: ["btc", "eth", "ltc", "xrp", "usd", "eur", "gbp"],
    FIAT: ["usd", "eur", "gbp"]
};