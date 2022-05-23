let config;

const nodeEnv = process.env.NODE_ENV || "development";

// If the node environment is production, then retreive the configurables from the repository, else
// just use the hardcoded configs.
if (nodeEnv === "development") {
    config = require("./development.js");
} 
else {
    config = require("./production.js");
}

module.exports = config;