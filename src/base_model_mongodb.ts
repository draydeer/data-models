///<reference path="../typings/index.d.ts"/>
import {BaseModel, Dict} from "./base_model";
import * as _ from "lodash";
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
        if (_.isFunction(this.db)) {
            this.db = this.db();
        }

        if (this.db instanceof Promise) {
            return this.db.then((db) => {
                this.db = db;

                return this.getCollection(alias);
            });
        }

        let collection = this.db.collection(alias ? alias : this.collection);

        let resolved = Promise.resolve(collection);

        this.getCollection = (anotherAlias?: string) => {
            return alias ? Promise.resolve(this.db.collection(anotherAlias)) : resolved;
        };

        return resolved;
    }

    /**
     * Prepare dictionary with potential pk selector.
     *
     * @param condition Mixed condition.
     *      If the model pk is a string tries to take condition as a primitive value and to cast it to the ObjectId
     *      type. Otherwise leaves it as-is.
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
    public static pkOrCond(condition: any): any {
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
    public static deleteAll(params?: Dict<any>, opts?: any): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.deleteMany(params, opts, (err: any, cur: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        rs(cur);
                    }
                })
            );
        });
    }

    /**
     *
     */
    public static deleteOne(params?: Dict<any>, opts?: any): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.deleteOne(params, opts, (err: any, res: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        res.result.n ? rs(res.result.n) : rj(new NotFoundError());
                    }
                })
            );
        });
    }

    /**
     *
     */
    public static deleteOneByPk(pk: any): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.deleteOne(this.pkOrCond(pk), (err: any, res: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        res.result.n ? rs(res.result.n) : rj(new NotFoundError());
                    }
                })
            );
        });
    }

    /**
     *
     */
    public static selectAll(params?: Dict<any>, opts?: any): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.find(params, opts, (err: any, cur: any) => {
                    if (err) {
                        rj(new Error(err));
                    } else {
                        rs(cur);
                    }
                })
            );
        });
    }

    /**
     *
     */
    public static selectAllAsArray(params?: Dict<any>, opts?: any, raw?: boolean): Promise<any> {
        return this.getCollection().then(
            (col) => col.find(params, opts || void 0).toArray().then(
                (res) => {
                    if (raw) {
                        return res;
                    }

                    _.each(res, (val: any, key: string) => {
                        res[key] = new this(val);
                    });

                    return res;
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static selectOne(params?: Dict<any>, opts?: any, raw?: boolean, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.findOne(params, opts || void 0).then(
                (doc) => {
                    if (doc) {
                        return raw ? doc : new this(doc);
                    }

                    throw new NotFoundError(notFoundError);
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static selectOneOrNew(params?: Dict<any>, opts?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.findOne(params, opts || void 0).then(
                (doc) => {
                    if (doc) {
                        return new this(doc);
                    }

                    return new this();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.findOne(this.pkOrCond(pk)).then(
                (doc) => {
                    if (doc) {
                        return raw ? doc : new this(doc);
                    }

                    return new NotFoundError(notFoundError);
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static selectOneByPkOrNew(pk: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.findOne(this.pkOrCond(pk)).then(
                (doc) => {
                    if (doc) {
                        return new this(doc);
                    }

                    return new this();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static insertOne(values: Dict<any>, fullResult?: boolean): Promise<any> {
        return this.getCollection().then(
            (col) => col.insertOne(values).then(
                (doc) => {
                    if (doc) {
                        return fullResult ? doc.ops : doc.insertedId;
                    }

                    throw new InternalError("Insert failed.");
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateAll(params: Dict<any>, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.update(params, {$set: values}, _.extend({multi: true}, opts)).then(
                (doc) => {
                    return doc.result.nModified;
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOne(params: Dict<any>, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, {$set: values}, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneRaw(params: Dict<any>, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, values, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneByPk(pk: any, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), {$set: values}, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneByPkRaw(pk: any, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), values, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneUnset(params: Dict<any>, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, {$unset: values}, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneByPkUnset(pk: any, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then((col) => col.updateOne(this.pkOrCond(pk), _.extend({upsert: true}, opts))
            .then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneUpsert(params: Dict<any> = {}, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, {$set: values}, _.extend({upsert: true}, opts)).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOneByPkUpsert(pk: any, values: Dict<any>, opts?: Dict<any>): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), {$set: values}, _.extend({upsert: true}, opts)).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
                    }

                    throw new NotFoundError();
                },
                (err) => {
                    throw new Error(err);
                }
            )
        );
    }

    /**
     *
     */
    public static updateOrInsert(params: Dict<any>, values: Dict<any>, insert: Dict<any>): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.updateOne(params, {$set: values}).then(
                    (doc) => {
                        doc.matchedCount
                            ? rs(doc.result.nModified)
                            : this.insertOne(insert).then((res) => rs(res.insertedId), rj);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                )
            );
        });
    }

    /**
     *
     */
    public static updateOrInsertByPk(pk: any, values: Dict<any>, insert: Dict<any>): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.updateOne(this.pkOrCond(pk), {$set: values}).then(
                    (doc) => {
                        doc.matchedCount
                            ? rs(doc.result.nModified)
                            : this.insertOne(insert).then((res) => rs(res.insertedId), rj);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                )
            );
        });
    }

    /**
     *
     */
    public static updateOrInsertRaw(params: Dict<any>, values: Dict<any>, insert: Dict<any>): Promise<any> {
        return new Promise<any>((rs, rj) => {
            this.getCollection().then(
                (col) => col.updateOne(params, values).then(
                    (doc) => {
                        doc.matchedCount
                            ? rs(doc.result.nModified)
                            : this.insertOne(insert).then((res) => rs(res.insertedId), rj);
                    },
                    (err) => {
                        rj(new Error(err));
                    }
                )
            );
        });
    }

}
