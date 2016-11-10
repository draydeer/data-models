///<reference path="../typings/index.d.ts"/>
import {BaseModel, BaseModelStatic} from "./base_model";
import * as _ from "lodash";
import * as mongodb from "mongodb";
import {NotFoundError} from "./errors/not_found_error";
import {InternalError} from "./errors/internal_error";

export type PromiseMongoDb = Promise<mongodb.Db>;

export type PromiseMongoDbCollection = Promise<mongodb.Collection>;

export interface BaseModelMongoDbStatic extends BaseModelStatic {

    getCollection(alias?: string): PromiseMongoDbCollection;

    clone(db?: any): BaseModelMongoDbStatic;

    pkOrCond(condition: any): any;

}

export class BaseModelMongoDb extends BaseModel {

    // collection alias
    protected static collection: string;

    // MongoDb instance
    protected static db: mongodb.Db|PromiseMongoDb|(() => mongodb.Db|PromiseMongoDb);

    // primary key field alias
    protected static pkKey: string = "_id";

    // [version control] field alias
    protected static versionKey: string = "_vc";

    /**
     * Get MongoDb collection object reference.
     */
    public static getCollection(alias?: string): PromiseMongoDbCollection {
        if (_.isFunction(this.db)) {
            this.db = (<() => mongodb.Db|PromiseMongoDb> this.db)();
        }

        if (this.db instanceof Promise) {
            return (<PromiseMongoDb> this.db).then((db) => {
                this.db = db;

                return this.getCollection(alias);
            });
        }

        let collection = (<mongodb.Db> this.db).collection(alias ? alias : this.collection);

        let resolved = Promise.resolve(collection);

        this.getCollection = (anotherAlias?: string): PromiseMongoDbCollection => {
            return alias ? Promise.resolve((<mongodb.Db> this.db).collection(anotherAlias)) : resolved;
        };

        return resolved;
    }

    /**
     *
     */
    public static clone(db?: any): BaseModelMongoDbStatic {
        return <BaseModelMongoDbStatic> (_.extend(super.clone(), {db: db}));
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
    public static recordId(recordId: string|mongodb.ObjectID): mongodb.ObjectID {
        return recordId instanceof mongodb.ObjectID ? recordId : new mongodb.ObjectID(recordId);
    }

    /**
     *
     */
    public static deleteAll(params?: Object, opts?: Object): Promise<any> {
        return this.getCollection().then(
            (col) => col.deleteMany(params, opts).then(
                (res) => {
                    return res.result.n;
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
    public static deleteOne(params?: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.deleteOne(params, opts).then(
                (res) => {
                    if (res.result.n) {
                        return res.result.n;
                    }
                    
                    throw new NotFoundError(notFoundError);
                }
            )
        );
    }

    /**
     *
     */
    public static deleteOneByPk(pk: any, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.deleteOne(this.pkOrCond(pk)).then(
                (res) => {
                    if (res.result.n) {
                        return res.result.n;
                    }

                    throw new NotFoundError(notFoundError);
                }
            )
        );
    }

    /**
     *
     */
    public static selectAll(params?: Object, opts?: Object): Promise<any> {
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
    public static selectAllAsArray(params?: Object, opts?: Object, raw?: boolean): Promise<any> {
        return this.getCollection().then(
            (col) => col.find(params, opts || void 0).toArray().then(
                (res) => {
                    if (raw) {
                        return res;
                    }

                    _.each(res, (val: any, key: string) => {
                        res[key] = new this();

                        res[key].assign(val);
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
    public static selectOne(params?: Object, opts?: Object, raw?: boolean, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.findOne(params, opts || void 0).then(
                (doc) => {
                    if (doc) {
                        return raw ? doc : new this().assign(doc);
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
    public static selectOneOrNew(params?: Object, opts?: Object): Promise<any> {
        return this.getCollection().then(
            (col) => col.findOne(params, opts || void 0).then(
                (doc) => {
                    if (doc) {
                        return new this().assign(doc);
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
                        return raw ? doc : new this().assign(doc);
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
                        return new this().assign(doc);
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
    public static insertOne(values: Object, fullResult?: boolean): Promise<any> {
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
    public static updateAll(params: Object, values: Object, opts?: Object): Promise<any> {
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
    public static updateOne(params: Object, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, {$set: values}, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneRaw(params: Object, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, values, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneByPk(pk: any, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), {$set: values}, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneByPkRaw(pk: any, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), values, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneUnset(params: Object, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, {$unset: values}, opts).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneByPkUnset(pk: any, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), values, _.extend({upsert: true}, opts)).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneUpsert(params: Object, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(params, {$set: values}, _.extend({upsert: true}, opts)).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOneByPkUpsert(pk: any, values: Object, opts?: Object, notFoundError?: any): Promise<any> {
        return this.getCollection().then(
            (col) => col.updateOne(this.pkOrCond(pk), {$set: values}, _.extend({upsert: true}, opts)).then(
                (doc) => {
                    if (doc.matchedCount) {
                        return doc.result.nModified;
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
    public static updateOrInsert(params: Object, values: Object, insert: Object): Promise<any> {
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
    public static updateOrInsertByPk(pk: any, values: Object, insert: Object): Promise<any> {
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
    public static updateOrInsertRaw(params: Object, values: Object, insert: Object): Promise<any> {
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
