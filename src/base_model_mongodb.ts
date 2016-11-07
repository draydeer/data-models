
import {BaseModel, Dict} from "./base_model";
import * as mongodb from "mongodb";
import {NotFoundError} from "./errors/not_found_error";
import {InternalError} from "./errors/internal_error";

export class BaseModelMongoDb extends BaseModel {

    // collection alias
    protected static collection: string;

    // MongoDb instance
    protected static db: any;

    // primary key field alias
    protected static pkKey: string = "_id";

    // [version control] field alias
    protected static versionKey: string = "_vc";

    /**
     * Get MongoDb collection object reference.
     */
    public static getCollection(alias?: string) {
        let collection = this.db.collection(alias ? alias : this.collection);

        this.getCollection = (anotherAlias?: string) => {
            return alias ? this.db.collection(anotherAlias) : collection;
        };

        return collection;
    }

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
    public static pkOrConditionDict(condition: any): any {
        if (typeof this.pkKey === "string") {
            if (condition instanceof mongodb.ObjectID) {
                return {[<string> this.pkKey]: condition};
            }

            if (typeof condition === "string") {
                return {[<string> this.pkKey]: new mongodb.ObjectID(condition)};
            }
        }

        return condition;
    }

    /**
     *
     */
    public static deleteAll(params?: Dict<any>, options?: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection().deleteMany(
                params, options,
                (err: any, cur: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        rs(cur);
                    }
                }
            );
        });
    }

    /**
     *
     */
    public static deleteOne(params?: Dict<any>, options?: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection().deleteOne(
                params, options,
                (err: any, res: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        res.result.n ? rs(res.result.n) : rj(new NotFoundError());
                    }
                }
            );
        });
    }

    /**
     *
     */
    public static deleteOneByPk(pk: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection().deleteOne(
                this.pkOrConditionDict(pk),
                (err: any, res: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        res.result.n ? rs(res.result.n) : rj(new NotFoundError());
                    }
                }
            );
        });
    }

    /**
     *
     */
    public static selectAll(params?: Dict<any>, options?: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection().find(
                params, options,
                (err: any, cur: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        rs(cur);
                    }
                }
            );
        });
    }

    /**
     *
     */
    public static selectAllAsArray(params?: Dict<any>, options?: any, raw?: boolean): Promise {
        return new Promise((rs, rj) => {
            this.getCollection().find(params, options || void 0).toArray(
                (err: any, arr: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        if (raw) {
                            return rs(arr);
                        }

                        this._().each(arr, (val: any, key: string) => {
                            arr[key] = new this(val);
                        });

                        rs(arr);
                    }
                }
            );
        });
    }

    /**
     *
     */
    public static selectOne(params?: Dict<any>, options?: any, raw?: boolean, notFoundError?: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .findOne(params, options || void 0)
                .then(
                    (doc) => {
                        doc === null ? rj(new NotFoundError(notFoundError)) : rs(raw ? doc : new this(doc));
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static selectOneOrNew(params?: Dict<any>, options?: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .findOne(params, options || void 0)
                .then(
                    (doc) => {
                        doc === null ? rs(new this()) : rs(new this(doc));
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .findOne(this.pkOrConditionDict(pk))
                .then(
                    (doc) => {
                        doc === null ? rj(new NotFoundError(notFoundError)) : rs(raw ? doc : new this(doc));
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static selectOneByPkOrNew(pk: any): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .findOne(this.pkOrConditionDict(pk))
                .then(
                    (doc) => {
                        doc === null ? rs(new this()) : rs(new this(doc));
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static insertOne(values: Dict<any>, fullResult?: boolean): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .insertOne(values)
                .then(
                    (doc) => {
                        doc === null ? rj(new NotFoundError()) : rs(fullResult ? doc.ops : doc.insertedId);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateAll(params: Dict<any>, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .update(params, {$set: values}, this._().extend({multi: true}, options))
                .then(
                    (doc) => {
                        rs(doc.result.nModified);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOne(params: Dict<any>, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(params, {$set: values}, options)
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneRaw(params: Dict<any>, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(params, values, options)
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneByPk(pk: any, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(this.pkOrConditionDict(pk), {$set: values}, options)
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneByPkRaw(pk: any, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(this.pkOrConditionDict(pk), values, options)
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneUnset(params: Dict<any>, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(params, {$unset: values}, options)
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneByPkUnset(pk: any, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(this.pkOrConditionDict(pk), this._().extend({upsert: true}, options))
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneUpsert(params: Dict<any> = {}, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(params, {$set: values}, this._().extend({upsert: true}, options))
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOneByPkUpsert(pk: any, values: Dict<any>, options?: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(this.pkOrConditionDict(pk), {$set: values}, this._().extend({upsert: true}, options))
                .then(
                    (doc) => {
                        doc.matchedCount ? rs(doc.result.nModified) : rj(new NotFoundError());
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOrInsert(params: Dict<any>, values: Dict<any>, insert: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(params, {$set: values})
                .then(
                    (doc) => {
                        doc.matchedCount
                            ? rs(doc.result.nModified)
                            : this.insertOne(insert).then((res) => rs(res.insertedId), rj);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOrInsertByPk(pk: any, values: Dict<any>, insert: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(this.pkOrConditionDict(pk), {$set: values})
                .then(
                    (doc) => {
                        doc.matchedCount
                            ? rs(doc.result.nModified)
                            : this.insertOne(insert).then((res) => rs(res.insertedId), rj);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

    /**
     *
     */
    public static updateOrInsertRaw(params: Dict<any>, values: Dict<any>, insert: Dict<any>): Promise {
        return new Promise((rs, rj) => {
            this.getCollection()
                .updateOne(params, values)
                .then(
                    (doc) => {
                        doc.matchedCount
                            ? rs(doc.result.nModified)
                            : this.insertOne(insert).then((res) => rs(res.insertedId), rj);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                );
        });
    }

}
