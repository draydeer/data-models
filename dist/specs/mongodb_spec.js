"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_model_mongodb_1 = require("../src/base_model_mongodb");
var bootstrap_1 = require("./bootstrap");
var mongodb = require("mongodb");
var MockA = (function (_super) {
    __extends(MockA, _super);
    function MockA() {
        _super.apply(this, arguments);
    }
    MockA.collection = "mock_a";
    MockA.db = bootstrap_1.mongodbConnection;
    MockA.pkKey = "ida";
    return MockA;
}(base_model_mongodb_1.BaseModelMongoDb));
var MockB = (function (_super) {
    __extends(MockB, _super);
    function MockB() {
        _super.apply(this, arguments);
    }
    MockB.collection = "mock_b";
    MockB.db = bootstrap_1.mongodbConnection;
    MockB.pkKey = "idb";
    return MockB;
}(base_model_mongodb_1.BaseModelMongoDb));
describe("MongoDb", function () {
    describe("model class", function () {
        it("should generate pk selector on pk defined as string and pk value defined as string", function () {
            var sel = MockA.pkOrCond("56bf7aa030042aff3e9c9339");
            expect("ida" in sel).toBeTruthy();
            expect(sel.ida instanceof mongodb.ObjectId).toBeTruthy();
            expect(sel.ida.toHexString()).toBe(new mongodb.ObjectId("56bf7aa030042aff3e9c9339").toHexString());
        });
        it("should generate pk selector on pk defined as string and pk value defined as ObjectId", function () {
            var sel = MockB.pkOrCond(new mongodb.ObjectId("56bf7aa030042aff3e9c9339"));
            expect("idb" in sel).toBeTruthy();
            expect(sel.idb instanceof mongodb.ObjectId).toBeTruthy();
            expect(sel.idb.toHexString()).toBe(new mongodb.ObjectId("56bf7aa030042aff3e9c9339").toHexString());
        });
        it("should generate pk selector with initial condition if condition defined as complex object", function () {
            expect(MockB.pkOrCond({ a: 123 })).toEqual({ a: 123 });
        });
    });
    it("db", function (done) {
        MockA.insertOne({ a: 1 }).then(function (r) {
            expect(true).toBe(1);
            console.log(r);
            done();
        }).catch(function (r) {
            expect(true).toBe(2);
            console.log(r);
            done();
        });
        setTimeout(function () {
            console.log(MockA.selectOne);
        }, 3000);
        MockB.selectOne().then(function (res) { return res.ss; });
        MockB.insertOne({ a: 2 }).then(function (r) {
            expect(true).toBe(1);
            console.log(r);
            done();
        }).catch(function (r) {
            expect(true).toBe(2);
            console.log(r);
            done();
        });
    });
});
