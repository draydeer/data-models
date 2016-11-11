"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_model_1 = require("./base_model");
var internal_error_1 = require("./errors/internal_error");
var not_found_error_1 = require("./errors/not_found_error");
var _ = require("lodash");
var mongodb = require("mongodb");
var base_model_2 = require("./base_model");
var BaseModelMongoDb = (function (_super) {
    __extends(BaseModelMongoDb, _super);
    function BaseModelMongoDb() {
        _super.apply(this, arguments);
    }
    BaseModelMongoDb.getCollection = function (alias) {
        var _this = this;
        if (_.isFunction(this.db)) {
            this.db = this.db();
        }
        if (this.db instanceof Promise) {
            return this.db.then(function (db) {
                _this.db = db;
                return _this.getCollection(alias);
            });
        }
        var resolved;
        if (_.isString(this.collection)) {
            resolved = Promise.resolve(this.db.collection(alias || this.collection));
        }
        else {
            resolved = Promise.resolve(this.collection);
        }
        this.getCollection = function (anotherAlias) {
            return alias ? Promise.resolve(_this.db.collection(anotherAlias)) : resolved;
        };
        if (alias) {
            return Promise.resolve(this.db.collection(alias));
        }
        return resolved;
    };
    BaseModelMongoDb.pkOrCond = function (condition) {
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
    BaseModelMongoDb.recordId = function (recordId) {
        return recordId instanceof mongodb.ObjectID ? recordId : new mongodb.ObjectID(recordId);
    };
    BaseModelMongoDb.deleteAll = function (params, opts) {
        return this.getCollection().then(function (col) { return col.deleteMany(params, opts).then(function (res) {
            return res.result.n;
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.deleteOne = function (params, opts, notFoundError) {
        return this.getCollection().then(function (col) { return col.deleteOne(params, opts).then(function (res) {
            if (res.result.n) {
                return res.result.n;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }); });
    };
    BaseModelMongoDb.deleteOneByPk = function (pk, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.deleteOne(_this.pkOrCond(pk)).then(function (res) {
            if (res.result.n) {
                return res.result.n;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }); });
    };
    BaseModelMongoDb.selectAll = function (params, opts) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().then(function (col) { return col.find(params, opts, function (err, cur) {
                if (err) {
                    rj(new Error(err));
                }
                else {
                    rs(cur);
                }
            }); });
        });
    };
    BaseModelMongoDb.selectAllAsArray = function (params, opts, raw) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.find(params, opts || void 0).toArray().then(function (res) {
            if (raw) {
                return res;
            }
            _.each(res, function (val, key) {
                res[key] = new _this();
                res[key].assign(val);
            });
            return res;
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.selectOne = function (params, opts, raw, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.findOne(params, opts || void 0).then(function (doc) {
            if (doc) {
                return raw ? doc : new _this().assign(doc);
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.selectOneOrNew = function (params, opts) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.findOne(params, opts || void 0).then(function (doc) {
            if (doc) {
                return new _this().assign(doc);
            }
            return new _this();
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.selectOneByPk = function (pk, raw, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.findOne(_this.pkOrCond(pk)).then(function (doc) {
            if (doc) {
                return raw ? doc : new _this().assign(doc);
            }
            return new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.selectOneByPkOrNew = function (pk) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.findOne(_this.pkOrCond(pk)).then(function (doc) {
            if (doc) {
                return new _this().assign(doc);
            }
            return new _this();
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.insertOne = function (values, fullResult) {
        return this.getCollection().then(function (col) { return col.insertOne(values).then(function (doc) {
            if (doc) {
                return fullResult ? doc.ops : doc.insertedId;
            }
            throw new internal_error_1.InternalError("Insert failed.");
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateAll = function (params, values, opts) {
        return this.getCollection().then(function (col) { return col.update(params, { $set: values }, _.extend({ multi: true }, opts)).then(function (doc) {
            return doc.result.nModified;
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOne = function (params, values, opts, notFoundError) {
        return this.getCollection().then(function (col) { return col.updateOne(params, { $set: values }, opts).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneRaw = function (params, values, opts, notFoundError) {
        return this.getCollection().then(function (col) { return col.updateOne(params, values, opts).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneByPk = function (pk, values, opts, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.updateOne(_this.pkOrCond(pk), { $set: values }, opts).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneByPkRaw = function (pk, values, opts, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.updateOne(_this.pkOrCond(pk), values, opts).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneUnset = function (params, values, opts, notFoundError) {
        return this.getCollection().then(function (col) { return col.updateOne(params, { $unset: values }, opts).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneByPkUnset = function (pk, values, opts, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.updateOne(_this.pkOrCond(pk), values, _.extend({ upsert: true }, opts)).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneUpsert = function (params, values, opts, notFoundError) {
        return this.getCollection().then(function (col) { return col.updateOne(params, { $set: values }, _.extend({ upsert: true }, opts)).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOneByPkUpsert = function (pk, values, opts, notFoundError) {
        var _this = this;
        return this.getCollection().then(function (col) { return col.updateOne(_this.pkOrCond(pk), { $set: values }, _.extend({ upsert: true }, opts)).then(function (doc) {
            if (doc.matchedCount) {
                return doc.result.nModified;
            }
            throw new not_found_error_1.NotFoundError(notFoundError);
        }, function (err) {
            throw new Error(err);
        }); });
    };
    BaseModelMongoDb.updateOrInsert = function (params, values, insert) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().then(function (col) { return col.updateOne(params, { $set: values }).then(function (doc) {
                doc.matchedCount
                    ? rs(doc.result.nModified)
                    : _this.insertOne(insert).then(function (res) { return rs(res.insertedId); }, rj);
            }, function (err) {
                rj(new Error(err));
            }); });
        });
    };
    BaseModelMongoDb.updateOrInsertByPk = function (pk, values, insert) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().then(function (col) { return col.updateOne(_this.pkOrCond(pk), { $set: values }).then(function (doc) {
                doc.matchedCount
                    ? rs(doc.result.nModified)
                    : _this.insertOne(insert).then(function (res) { return rs(res.insertedId); }, rj);
            }, function (err) {
                rj(new Error(err));
            }); });
        });
    };
    BaseModelMongoDb.updateOrInsertRaw = function (params, values, insert) {
        var _this = this;
        return new Promise(function (rs, rj) {
            _this.getCollection().then(function (col) { return col.updateOne(params, values).then(function (doc) {
                doc.matchedCount
                    ? rs(doc.result.nModified)
                    : _this.insertOne(insert).then(function (res) { return rs(res.insertedId); }, rj);
            }, function (err) {
                rj(new Error(err));
            }); });
        });
    };
    BaseModelMongoDb.pkKey = "_id";
    BaseModelMongoDb.versionKey = "_vc";
    return BaseModelMongoDb;
}(base_model_1.BaseModel));
exports.BaseModelMongoDb = BaseModelMongoDb;
var BaseMapperMongoDb = (function (_super) {
    __extends(BaseMapperMongoDb, _super);
    function BaseMapperMongoDb(db, collection) {
        _super.call(this);
        this.pkKey = "_id";
        this.versionKey = "_vc";
        this.getCollection = BaseModelMongoDb.getCollection;
        this.pkOrCond = BaseModelMongoDb.pkOrCond;
        this.recordId = BaseModelMongoDb.recordId;
        this.deleteAll = BaseModelMongoDb.deleteAll;
        this.deleteOne = BaseModelMongoDb.deleteOne;
        this.deleteOneByPk = BaseModelMongoDb.deleteOneByPk;
        this.selectAll = BaseModelMongoDb.selectAll;
        this.selectAllAsArray = BaseModelMongoDb.selectAllAsArray;
        this.selectOne = BaseModelMongoDb.selectOneRaw;
        this.selectOneOrNew = BaseModelMongoDb.selectOneOrNew;
        this.selectOneByPk = BaseModelMongoDb.selectOneByPkRaw;
        this.selectOneByPkOrNew = BaseModelMongoDb.selectOneByPkOrNew;
        this.insertOne = BaseModelMongoDb.insertOne;
        this.updateAll = BaseModelMongoDb.updateAll;
        this.updateOne = BaseModelMongoDb.updateOne;
        this.updateOneRaw = BaseModelMongoDb.updateOneRaw;
        this.updateOneByPk = BaseModelMongoDb.updateOneByPk;
        this.updateOneByPkRaw = BaseModelMongoDb.updateOneByPkRaw;
        this.updateOneUnset = BaseModelMongoDb.updateOneUnset;
        this.updateOneByPkUnset = BaseModelMongoDb.updateOneByPkUnset;
        this.updateOneUpsert = BaseModelMongoDb.updateOneUpsert;
        this.updateOneByPkUpsert = BaseModelMongoDb.updateOneByPkUpsert;
        this.updateOrInsert = BaseModelMongoDb.updateOrInsert;
        this.updateOrInsertByPk = BaseModelMongoDb.updateOrInsertByPk;
        this.updateOrInsertRaw = BaseModelMongoDb.updateOrInsertRaw;
        if (collection) {
            this.collection = collection;
        }
        this.db = db;
    }
    return BaseMapperMongoDb;
}(base_model_2.BaseMapper));
exports.BaseMapperMongoDb = BaseMapperMongoDb;
