"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var bad_parameter_error_1 = require("./errors/bad_parameter_error");
var events_1 = require("events");
var _ = require("lodash");
var internal_error_1 = require("./errors/internal_error");
function getDocPkComplex(doc, pk, wantNull) {
    var result = {};
    for (var i = pk.length; i > 0; i--) {
        if (pk[i] in doc) {
            result[pk[i]] = doc[pk[i]];
        }
        else {
            return wantNull ? null : {};
        }
    }
    return result;
}
function getDocPkSimple(doc, pk, wantNull) {
    return pk in doc[pk] ? doc[pk] : (wantNull ? null : doc[pk]);
}
function setDocPkComplex(doc, pk, pkValue) {
    var result = getDocPkComplex(pkValue, pk, true);
    if (result) {
        for (var i = pk.length; i > 0; i--) {
            doc[pk[i]] = result[pk[i]];
        }
    }
    return doc;
}
function setDocPkSimple(doc, pk, pkValue) {
    doc[pk] = pkValue;
    return doc;
}
function unsetDocPkComplex(doc, pk) {
    _.each(pk, function (key) { return delete doc[key]; });
    return doc;
}
function unsetDocPkSimple(doc, pk) {
    delete doc[pk];
    return doc;
}
function setDocPkClassAccessors(cls, pk) {
    if (_.isArray(pk)) {
        cls.getDocPk = function (d, n) { return getDocPkComplex(d, pk, n); };
        cls.getDocPkDict = function (d, n) { return getDocPkComplex(d, pk, n); };
        cls.setDocPk = function (d, v) { return setDocPkComplex(d, pk, v); };
        cls.unsetDocPk = function (d) { return unsetDocPkComplex(d, pk); };
    }
    else if (_.isString(pk)) {
        cls.getDocPk = function (d, n) { return getDocPkSimple(d, pk); };
        cls.getDocPkDict = function (d, n) { return ((_a = {}, _a[pk] = getDocPkSimple(d, pk), _a)); var _a; };
        cls.setDocPk = function (d, v) { return setDocPkSimple(d, pk, v); };
        cls.unsetDocPk = function (d) { return unsetDocPkSimple(d, pk); };
    }
    else {
        throw new internal_error_1.InternalError("Pk value must be a string or an array of strings.");
    }
    return cls;
}
var BaseModel = (function (_super) {
    __extends(BaseModel, _super);
    function BaseModel(values) {
        _super.call(this);
        if (values) {
            this.assign(values);
        }
    }
    BaseModel.getDocPk = function (doc, wantNull) {
        return setDocPkClassAccessors(this, this.pkKey).getDocPk(doc, wantNull);
    };
    BaseModel.getDocPkDict = function (doc, wantNull) {
        return setDocPkClassAccessors(this, this.pkKey).getDocPkDict(doc, wantNull);
    };
    BaseModel.getDocVersion = function (doc) {
        return doc[this.versionKey];
    };
    BaseModel.getIdKey = function () {
        return this.idKey;
    };
    BaseModel.getPkKey = function () {
        return this.pkKey;
    };
    BaseModel.getVersionKey = function () {
        return this.versionKey;
    };
    BaseModel.setDocPk = function (doc, pk) {
        return setDocPkClassAccessors(this, this.pkKey).setDocPk(doc, pk);
    };
    BaseModel.setDocVersion = function (doc, version) {
        doc[this.versionKey] = version;
        return doc;
    };
    BaseModel.unsetDocPk = function (doc) {
        return setDocPkClassAccessors(this, this.pkKey).unsetDocPk(doc);
    };
    BaseModel.unsetDocVersion = function (doc) {
        delete doc[this.versionKey];
        return doc;
    };
    BaseModel.check = function (validator, value) {
        return this.onCheck(validator, value) === true;
    };
    BaseModel.checkErrorsPromise = function (validator) {
        return Promise.reject(new bad_parameter_error_1.BadParameterError(this.onCheckGetErrors(validator)));
    };
    BaseModel.clone = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        var $class = function () { };
        $class.prototype = this;
        return (new $class());
    };
    BaseModel.recordId = function (recordId) {
        return recordId;
    };
    BaseModel.relation = function (left, right, type) {
        return new BaseModelRelation(left, right, type);
    };
    BaseModel.deleteAll = function (params, options) {
        return Promise.reject(new Error("[deleteAll] is not implemented."));
    };
    BaseModel.deleteOne = function (params, options) {
        return Promise.reject(new Error("[deleteOne] is not implemented."));
    };
    BaseModel.deleteOneByPk = function (pk) {
        return Promise.reject(new Error("[deleteOneByPk] is not implemented."));
    };
    BaseModel.selectAll = function (params, options) {
        return Promise.reject(new Error("[selectAll] is not implemented."));
    };
    BaseModel.selectAllIn = function (key, inList, options) {
        return this.selectAll((_a = {}, _a[key] = { $in: inList }, _a), options);
        var _a;
    };
    BaseModel.selectAllAsArray = function (params, options, raw) {
        return Promise.reject(new Error("[selectAllAsArray] is not implemented."));
    };
    BaseModel.selectAllAsArrayIn = function (key, inList, options, raw) {
        return this.selectAllAsArray((_a = {}, _a[key] = { $in: inList }, _a), options, raw);
        var _a;
    };
    BaseModel.selectOne = function (params, options, raw, notFoundError) {
        return Promise.reject(new Error("[selectOne] is not implemented."));
    };
    BaseModel.selectOneRaw = function (params, options, notFoundError) {
        return this.selectOne(params, options, false, notFoundError);
    };
    BaseModel.selectOneOrNew = function (params, options) {
        return Promise.reject(new Error("[selectOneOrNew] is not implemented."));
    };
    BaseModel.selectOneByPk = function (pk, raw, notFoundError) {
        return Promise.reject(new Error("[selectOneByPk] is not implemented."));
    };
    BaseModel.selectOneByPkRaw = function (pk, notFoundError) {
        return this.selectOneByPk(pk, false, notFoundError);
    };
    BaseModel.selectOneByPkOrNew = function (pk) {
        return Promise.reject(new Error("[selectOneByPkOrNew] is not implemented."));
    };
    BaseModel.insertOne = function (values, fullResult) {
        return Promise.reject(new Error("[insertOne] is not implemented."));
    };
    BaseModel.updateAll = function (params, values, options) {
        return Promise.reject(new Error("[updateAll] is not implemented."));
    };
    BaseModel.updateOne = function (params, values, options) {
        return Promise.reject(new Error("[updateOne] is not implemented."));
    };
    BaseModel.updateOneRaw = function (params, values, options) {
        return Promise.reject(new Error("[updateOneRaw] is not implemented."));
    };
    BaseModel.updateOneByPk = function (pk, values, options) {
        return Promise.reject(new Error("[updateOneByPk] is not implemented."));
    };
    BaseModel.updateOneByPkRaw = function (pk, values, options) {
        return Promise.reject(new Error("[updateOneByPkRaw] is not implemented."));
    };
    BaseModel.updateOneUnset = function (params, values, options) {
        return Promise.reject(new Error("[updateOneUnset] is not implemented."));
    };
    BaseModel.updateOneByPkUnset = function (pk, values, options) {
        return Promise.reject(new Error("[updateOneByPkUnset] is not implemented."));
    };
    BaseModel.updateOneUpsert = function (params, values, options) {
        if (params === void 0) { params = {}; }
        return Promise.reject(new Error("[updateOneUpsert] is not implemented."));
    };
    BaseModel.updateOneByPkUpsert = function (pk, values, options) {
        return Promise.reject(new Error("[updateOneByPkUpsert] is not implemented."));
    };
    BaseModel.updateOrInsert = function (params, values, insert) {
        return Promise.reject(new Error("[updateOrInsert] is not implemented."));
    };
    BaseModel.updateOrInsertByPk = function (pk, values, insert) {
        return Promise.reject(new Error("[updateOrInsertByPk] is not implemented."));
    };
    BaseModel.updateOrInsertRaw = function (params, values, insert) {
        return Promise.reject(new Error("[updateOrInsertRaw] is not implemented."));
    };
    BaseModel.delByPk = function (pk) {
        var temp = {
            pk: pk,
        };
        if (this.validatorOnSelectByPk && this.check(this.validatorOnSelectByPk, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByPk);
        }
        return this.deleteOneByPk(temp.pk);
    };
    BaseModel.oneByDocId = function (id, notFoundError) {
        var temp = (_a = {},
            _a[this.idKey] = id,
            _a
        );
        if (this.validatorOnSelectByDocId && this.check(this.validatorOnSelectByDocId, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByDocId);
        }
        return this.selectOneRaw((_b = {}, _b[this.idKey] = temp[this.idKey], _b), {}, notFoundError);
        var _a, _b;
    };
    BaseModel.oneByPk = function (pk, notFoundError) {
        var temp = {
            pk: pk,
        };
        if (this.validatorOnSelectByPk && this.check(this.validatorOnSelectByPk, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByPk);
        }
        return this.selectOneByPkRaw(temp.pk, notFoundError);
    };
    BaseModel.updByPk = function (pk, values) {
        var temp = {
            pk: pk,
        };
        if (this.validatorOnSelectByPk && this.check(this.validatorOnSelectByPk, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByPk);
        }
        return this.updateOneByPk(temp.pk, values);
    };
    BaseModel.onCheck = function (validator, value) {
        return true;
    };
    BaseModel.onCheckGetErrors = function (validator, checkingResult) {
        return null;
    };
    BaseModel.prototype._ = function () {
        return _;
    };
    BaseModel.prototype.getId = function () {
        return this.getStaticClass().getDocPk(this);
    };
    BaseModel.prototype.getStaticClass = function () {
        return (this.constructor);
    };
    BaseModel.prototype.assign = function (mixed) {
        _.extend(this, mixed);
        return this;
    };
    BaseModel.prototype.insert = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return this.getStaticClass().insertOne(_.omitBy(this, this.getStaticClass().setDocVersion(this, 1))).then(function (recordId) {
            _this.getStaticClass().setDocPk(_this, recordId);
        });
    };
    BaseModel.prototype.isNew = function () {
        return !this.getId();
    };
    BaseModel.prototype.put = function (options) {
        return this.getId() ? this.updateVersioned(options) : this.insert(options);
    };
    BaseModel.prototype.update = function (options) {
        return this.getStaticClass().updateOneByPk(this.getStaticClass().getDocPk(this), _.omitBy(this, _.isUndefined), options);
    };
    BaseModel.prototype.updateVersioned = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var $class = this.getStaticClass();
        var $id = $class.getDocPk(this);
        $class.unsetDocPk(this);
        if ($class.getVersionKey()) {
            var $vcUpdate = $class.getDocVersion(this) > 0 ? $class.getDocVersion(this) : void 0;
            if ($class.getDocVersion(this) > 0) {
                $class.setDocVersion(this, $class.getDocVersion(this) + 1);
            }
            else {
                $class.setDocVersion(this, 1);
            }
            return this.getStaticClass().updateOne($class.setDocPk($class.setDocVersion({}, $vcUpdate), $id), _.omitBy(this, _.isUndefined), options).then(function (res) {
                $class.setDocPk(_this, $id);
                return res;
            }, function (err) {
                $class.setDocPk(_this, $id);
                return err;
            });
        }
        else {
            return this.getStaticClass().updateOne($class.setDocPk({}, $id), _.omitBy(this, _.isUndefined), options).then(function (res) {
                $class.setDocPk(_this, $id);
                return res;
            }, function (err) {
                $class.setDocPk(_this, $id);
                return err;
            });
        }
    };
    BaseModel.idKey = "id";
    BaseModel.pkKey = "?";
    return BaseModel;
}(events_1.EventEmitter));
exports.BaseModel = BaseModel;
var BaseModelRelation = (function () {
    function BaseModelRelation(left, right, type) {
        this.left = left;
        this.right = right;
        this.type = type;
    }
    return BaseModelRelation;
}());
exports.BaseModelRelation = BaseModelRelation;
