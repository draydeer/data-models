"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_model_1 = require("./base_model");
var BaseModelKnex = (function (_super) {
    __extends(BaseModelKnex, _super);
    function BaseModelKnex() {
        _super.apply(this, arguments);
    }
    /**
     * Prepare cursor [where] conditions in mongo-like syntax.
     *
     * @param cursor Cursor object.
     * @param where Where conditions.
     * @param cb Callback to return stream object. If not provided query result will be fetched entirely (usable for single documents).
     *
     * @returns {any}
     */
    BaseModelKnex.getCursorWhere = function (cursor, where, cb) {
        if (this._().isEmpty(where) === false) {
            var paramIndex = 100;
            for (var key in where) {
                if (where.hasOwnProperty(key)) {
                    if (key === "$or") {
                        // cur.orWhere(k, where["$or"]);
                        delete where.$or;
                        continue;
                    }
                    if (this._().isObject(where[key])) {
                        var w = where[key];
                        if ("$gt" in w) {
                            paramIndex++;
                            cursor.andWhere(key, ">", w.$gt);
                        }
                        if ("$gte" in w) {
                            paramIndex++;
                            cursor.andWhere(key, ">=", w.$gte);
                        }
                        if ("$in" in w) {
                            paramIndex++;
                            cursor.whereIn(key, w.$in);
                        }
                        if ("$is" in w) {
                            paramIndex++;
                            cursor.andWhere(key, "IS", w.$is);
                        }
                        if ("$like" in w) {
                            paramIndex++;
                            cursor.andWhere(key, "LIKE", w.$like);
                        }
                        if ("$lt" in w) {
                            paramIndex++;
                            cursor.andWhere(key, "<", w.$lt);
                        }
                        if ("$lte" in w) {
                            paramIndex++;
                            cursor.andWhere(key, "<=", w.$lte);
                        }
                        if ("$ne" in w) {
                            paramIndex++;
                            cursor.andWhere(key, "<>", w.$ne);
                        }
                    }
                    else {
                        paramIndex++;
                        cursor.andWhere(key, where[key]);
                    }
                }
            }
        }
        return cb ? cursor.stream(cb) : this.getDb().raw(cursor.toString());
    };
    return BaseModelKnex;
}(base_model_1.BaseModel));
exports.BaseModelKnex = BaseModelKnex;
//# sourceMappingURL=base_model_knex.js.map