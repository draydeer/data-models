"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_model_1 = require("./base_model");
var mongodb = require("mongodb");
var not_found_error_1 = require("./errors/not_found_error");
var BaseModelMongoDb = (function (_super) {
    __extends(BaseModelMongoDb, _super);
    function BaseModelMongoDb() {
        _super.apply(this, arguments);
    }
    /**
     * Get MongoDb collection object reference.
     */
    BaseModelMongoDb.getCollection = function (alias) {
        var _this = this;
        var collection = this.db.collection(alias ? alias : this.collection);
        this.getCollection = function (anotherAlias) {
            return alias ? _this.db.collection(anotherAlias) : collection;
        };
        return collection;
    };
    /**
     * Prepare dictionary with potential pk selector.
     *
     * @param condition Mixed condition. If the model pk is a string tries to take condition as a primitive value and
     *      cast it to the ObjectId type:
     *
     *      model pk key = "_id"
     *      condition = "56bf7aa030042aff3e9c9339"
     *      result = {_id: ObjectId("56bf7aa030042aff3e9c9339")}
     *
     *      model pk key = "id"
     *      condition = ObjectId("56bf7aa030042aff3e9c9339")
     *      result = {id: ObjectId("56bf7aa030042aff3e9c9339")}
     *
     *      model pk key = [...]
     *      condition = {a: 123}
     *      result = {a: 123}
     *
     * @returns {any}
     */
    BaseModelMongoDb.pkOrConditionDict = function (condition) {
        if (typeof this.pkKey === "string") {
            if (condition instanceof mongodb.ObjectID) {
                return (_a = {}, _a[this.pkKey] = condition, _a);
            }
            if (typeof condition === "string") {
                return (_b = {}, _b[this.pkKey] = new mongodb.ObjectID(condition), _b);
            }
        }
        return condition;
        var _a, _b;
    };
    /**
     *
     */
    BaseModelMongoDb.deleteAll = function (params, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().deleteMany(params, options, function (err, cur) {
                if (err) {
                    rj(new Error(err));
                }
                else {
                    rs(cur);
                }
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.deleteOne = function (params, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().deleteOne(params, options, function (err, res) {
                if (err) {
                    rj(new Error(err));
                }
                else {
                    res.result.n ? rs(res.result.n) : rj(new not_found_error_1.NotFoundError());
                }
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.deleteOneByPk = function (pk) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().deleteOne(_this.pkOrConditionDict(pk), function (err, res) {
                if (err) {
                    rj(new Error(err));
                }
                else {
                    res.result.n ? rs(res.result.n) : rj(new not_found_error_1.NotFoundError());
                }
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.selectAll = function (params, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().find(params, options, function (err, cur) {
                if (err) {
                    rj(new Error(err));
                }
                else {
                    rs(cur);
                }
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.selectAllAsArray = function (params, options, raw) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().find(params, options || void 0).toArray(function (err, arr) {
                if (err) {
                    rj(new Error(err));
                }
                else {
                    if (raw) {
                        return rs(arr);
                    }
                    _this._().each(arr, function (val, key) {
                        arr[key] = new _this(val);
                    });
                    rs(arr);
                }
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.selectOne = function (params, options, raw, notFoundError) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .findOne(params, options || void 0)
                .then(function (doc) {
                doc === null ? rj(new not_found_error_1.NotFoundError(notFoundError)) : rs(raw ? doc : new _this(doc));
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.selectOneOrNew = function (params, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .findOne(params, options || void 0)
                .then(function (doc) {
                doc === null ? rs(new _this()) : rs(new _this(doc));
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.selectOneByPk = function (pk, raw, notFoundError) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .findOne(_this.pkOrConditionDict(pk))
                .then(function (doc) {
                doc === null ? rj(new not_found_error_1.NotFoundError(notFoundError)) : rs(raw ? doc : new _this(doc));
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.selectOneByPkOrNew = function (pk) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .findOne(_this.pkOrConditionDict(pk))
                .then(function (doc) {
                doc === null ? rs(new _this()) : rs(new _this(doc));
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.insertOne = function (values, fullResult) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .insertOne(values)
                .then(function (doc) {
                doc === null ? rj(new not_found_error_1.NotFoundError()) : rs(fullResult ? doc.ops : doc.insertedId);
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateAll = function (params, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .update(params, { $set: values }, _this._().extend({ multi: true }, options))
                .then(function (doc) {
                rs(doc.result.nModified);
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOne = function (params, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(params, { $set: values }, options)
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneRaw = function (params, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(params, values, options)
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneByPk = function (pk, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(_this.pkOrConditionDict(pk), { $set: values }, options)
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneByPkRaw = function (pk, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(_this.pkOrConditionDict(pk), values, options)
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneUnset = function (params, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(params, { $unset: values }, options)
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneByPkUnset = function (pk, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(_this.pkOrConditionDict(pk), _this._().extend({ upsert: true }, options))
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneUpsert = function (params, values, options) {
        var _this = this;
        if (params === void 0) { params = {}; }
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(params, { $set: values }, _this._().extend({ upsert: true }, options))
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOneByPkUpsert = function (pk, values, options) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(_this.pkOrConditionDict(pk), { $set: values }, _this._().extend({ upsert: true }, options))
                .then(function (doc) {
                doc.matchedCount ? rs(doc.result.nModified) : rj(new not_found_error_1.NotFoundError());
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOrInsert = function (params, values, insert) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(params, { $set: values })
                .then(function (doc) {
                doc.matchedCount
                    ? rs(doc.result.nModified)
                    : _this.insertOne(insert).then(function (res) { return rs(res.insertedId); }, rj);
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOrInsertByPk = function (pk, values, insert) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(_this.pkOrConditionDict(pk), { $set: values })
                .then(function (doc) {
                doc.matchedCount
                    ? rs(doc.result.nModified)
                    : _this.insertOne(insert).then(function (res) { return rs(res.insertedId); }, rj);
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    /**
     *
     */
    BaseModelMongoDb.updateOrInsertRaw = function (params, values, insert) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection()
                .updateOne(params, values)
                .then(function (doc) {
                doc.matchedCount
                    ? rs(doc.result.nModified)
                    : _this.insertOne(insert).then(function (res) { return rs(res.insertedId); }, rj);
            }, function (err) {
                rj(new Error(err));
            });
        });
    };
    // primary key field alias
    BaseModelMongoDb.pkKey = "_id";
    // [version control] field alias
    BaseModelMongoDb.versionKey = "_vc";
    return BaseModelMongoDb;
}(base_model_1.BaseModel));
exports.BaseModelMongoDb = BaseModelMongoDb;
//# sourceMappingURL=base_model_mongodb.js.map