const mongoose = require('mongoose');

module.exports = {
    connectTOMongoDB: async function(url) {
        return mongoose.connect(url);
    }
};

console.log("connect.js loaded");
