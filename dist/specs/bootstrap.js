"use strict";
var mongodb_1 = require("mongodb");
exports.mongodbConnection = function () {
    return new Promise(function (rs, rj) {
        mongodb_1.MongoClient.connect('mongodb://localhost:27017/test_models', function (err, db) {
            exports.mongodbConnection = function () { return Promise.resolve(db); };
            rs(db);
        });
    });
};
