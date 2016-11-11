///<reference path="../typings/index.d.ts"/>
import {BadParameterError} from "./errors/bad_parameter_error";
import {EventEmitter} from "events";
import * as _ from "lodash";
import {InternalError} from "./errors/internal_error";
import {BaseModelStatic} from "./";
import {ModelMongoDb} from "./index";

export type Dict<T> = _.Dictionary<T>;

export interface BaseModelStatic {

    check(validator: any, value: any): any;

    checkErrorsPromise(validator: any): Promise<any>;

    getDocPk(doc: any): any;

    getDocVersion(doc: any): number;

    getIdKey(): any;

    getPkKey(): any;

    getVersionKey(): any;

    unsetDocPk(doc: any): any;

    setDocPk(doc: any, id: string): any;

    setDocVersion(doc: any, version: number): any;

    unsetDocVersion(doc: any): any;

    deleteAll(params?: Object, options?: any): Promise<any>;

    deleteOne(params?: Object, options?: any): Promise<any>;

    deleteOneByPk(pk: any): Promise<any>;

    selectAll(params?: Object, options?: any): Promise<any>;

    selectAllIn(key: string, inList: any[], options?: any): Promise<any>;

    selectAllAsArray(params?: Object, options?: any, raw?: boolean): Promise<any>;

    selectAllAsArrayIn(key: string, inList: any[], options?: any, raw?: boolean): Promise<any>;

    selectOne(params?: Object, options?: any, raw?: boolean, notFoundError?: any): Promise<any>;

    selectOneRaw(params?: Object, options?: any, notFoundError?: any): Promise<any>;

    selectOneOrNew(params?: Object, options?: any): Promise<any>;

    selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise<any>;

    selectOneByPkRaw(pk: any, notFoundError?: any): Promise<any>;

    selectOneByPkOrNew(pk: any): Promise<any>;

    insertOne(values: Object, fullResult?: boolean): Promise<any>;

    updateAll(params: Object, values: Object, options?: Object): Promise<any>;

    updateOne(params: Object, values: Object, options?: Object): Promise<any>;

    updateOneRaw(params: Object, values: Object, options?: Object): Promise<any>;

    updateOneByPk(pk: any, values: Object, options?: Object): Promise<any>;

    updateOneByPkRaw(pk: any, values: Object, options?: Object): Promise<any>;

    updateOneUnset(params: Object, values: Object, options?: Object): Promise<any>;

    updateOneByPkUnset(pk: any, values: Object, options?: Object): Promise<any>;

    updateOneUpsert(params: Object, values: Object, options?: Object): Promise<any>;

    updateOneByPkUpsert(pk: any, values: Object, options?: Object): Promise<any>;

    updateOrInsert(params: Object, values: Object, insert: Object): Promise<any>;

    updateOrInsertByPk(pk: any, values: Object, insert: Object): Promise<any>;

    updateOrInsertRaw(params: Object, values: Object, insert: Object): Promise<any>;

}

function getDocPkComplex(doc: Object, pk: string[], wantNull?: boolean): Object {
    let result = {};

    for (let i = pk.length; i > 0; i --) {
        if (pk[i] in doc) {
            result[pk[i]] = doc[pk[i]];
        } else {
            return wantNull ? null : {};
        }
    }

    return result;
}

function getDocPkSimple(doc: Object, pk: string, wantNull?: boolean): any {
    return pk in doc[pk] ? doc[pk] : (wantNull ? null : doc[pk]);
}

function setDocPkComplex(doc: Object, pk: string[], pkValue: Object): Object {
    let result = getDocPkComplex(pkValue, pk, true);

    if (result) {
        for (let i = pk.length; i > 0; i --) {
            doc[pk[i]] = result[pk[i]];
        }
    }

    return doc;
}

function setDocPkSimple(doc: Object, pk: string, pkValue: any): any {
    doc[pk] = pkValue;

    return doc;
}

function unsetDocPkComplex(doc: Object, pk: string[]): any {
    _.each(pk, (key: string) => delete doc[key]);

    return doc;
}

function unsetDocPkSimple(doc: Object, pk: string): any {
    delete doc[pk];

    return doc;
}

function setDocPkClassAccessors(cls: any, pk: string|string[]): any {
    if (_.isArray(pk)) {
        cls.getDocPk = (d: Object, n?: boolean) => getDocPkComplex(d, <string[]> pk, n);

        cls.getDocPkDict = (d: Object, n?: boolean) => getDocPkComplex(d, <string[]> pk, n);

        cls.setDocPk = (d: Object, v?: any) => setDocPkComplex(d, <string[]> pk, v);

        cls.unsetDocPk = (d: Object) => unsetDocPkComplex(d, <string[]> pk);
    } else if (_.isString(pk)) {
        cls.getDocPk = (d: Object, n?: boolean) => getDocPkSimple(d, <string> pk);

        cls.getDocPkDict = (d: Object, n?: boolean) => ({[<string> pk]: getDocPkSimple(d, <string> pk)});

        cls.setDocPk = (d: Object, v?: any) => setDocPkSimple(d, <string> pk, v);

        cls.unsetDocPk = (d: Object) => unsetDocPkSimple(d, <string> pk);
    } else {
        throw new InternalError("Pk value must be a string or an array of strings.");
    }

    return cls;
}

export class BaseModel extends EventEmitter {

    // id field alias
    public static idKey: number|string = "id";

    // primary key field alias
    public static pkKey: string|string[] = "?";

    // [version control] field alias
    public static versionKey: string;

    // relations
    public static relations: Dict<BaseModelRelation>;

    // validator on select by document id - [id] field
    public static validatorOnSelectByDocId: any;

    // validator on select by record id - [_id] field
    public static validatorOnSelectByPk: any;

    /**
     * Get document primary key value.
     */
    public static getDocPk(doc: Object, wantNull?: boolean): any {
        return setDocPkClassAccessors(this, this.pkKey).getDocPk(doc, wantNull);
    }

    /**
     * Get document primary key value as associated value of dictionary.
     */
    public static getDocPkDict(doc: Object, wantNull?: boolean): any {
        return setDocPkClassAccessors(this, this.pkKey).getDocPkDict(doc, wantNull);
    }

    /**
     * Get document version.
     */
    public static getDocVersion(doc: Object): number {
        return doc[this.versionKey];
    }

    /**
     *
     */
    public static getIdKey(): any {
        return this.idKey;
    }

    /**
     *
     */
    public static getPkKey(): any {
        return this.pkKey;
    }

    /**
     *
     */
    public static getVersionKey(): any {
        return this.versionKey;
    }

    /**
     * Set document primary key value.
     */
    public static setDocPk(doc: Object, pk: any): any {
        return setDocPkClassAccessors(this, this.pkKey).setDocPk(doc, pk);
    }

    /**
     * Set document version.
     */
    public static setDocVersion(doc: any, version: number): any {
        doc[this.versionKey] = version;

        return doc;
    }

    /**
     * Unset document primary key value.
     */
    public static unsetDocPk(doc: any): any {
        return setDocPkClassAccessors(this, this.pkKey).unsetDocPk(doc);
    }

    /**
     * Unset document version.
     */
    public static unsetDocVersion(doc: any): any {
        delete doc[this.versionKey];

        return doc;
    }

    /**
     * Check given arguments with validator.
     */
    public static check(validator: any, value: any): any {
        return this.onCheck(validator, value) === true;
    }

    /**
     * Create [BadParameterError] instance with errors from validator.
     */
    public static checkErrorsPromise(validator: any): Promise<any> {
        return Promise.reject(new BadParameterError(this.onCheckGetErrors(validator)));
    }

    /**
     * Prepare specified to the storage engine record id.
     */
    public static recordId(recordId: any): any {
        return recordId;
    }

    /**
     *
     */
    public static relation(left: any, right: any, type: string): BaseModelRelation {
        return new BaseModelRelation(left, right, type);
    }

    /**
     *
     */
    public static deleteAll(params?: Object, options?: any): Promise<any> {
        return Promise.reject(new Error("[deleteAll] is not implemented."));
    }

    /**
     *
     */
    public static deleteOne(params?: Object, options?: any): Promise<any> {
        return Promise.reject(new Error("[deleteOne] is not implemented."));
    }

    /**
     *
     */
    public static deleteOneByPk(pk: any): Promise<any> {
        return Promise.reject(new Error("[deleteOneByPk] is not implemented."));
    }

    /**
     *
     */
    public static selectAll(params?: Object, options?: any): Promise<any> {
        return Promise.reject(new Error("[selectAll] is not implemented."));
    }

    /**
     * Select all performing [in] values search.
     */
    public static selectAllIn(key: string, inList: any[], options?: any): Promise<any> {
        return this.selectAll({[key]: {$in: inList}}, options);
    }

    /**
     *
     */
    public static selectAllAsArray(params?: Object, options?: any, raw?: boolean): Promise<any> {
        return Promise.reject(new Error("[selectAllAsArray] is not implemented."));
    }

    /**
     * Select all as array performing [in] values search.
     */
    public static selectAllAsArrayIn(key: string, inList: any[], options?: any, raw?: boolean): Promise<any> {
        return this.selectAllAsArray({[key]: {$in: inList}}, options, raw);
    }

    /**
     *
     */
    public static selectOne(params?: Object, options?: any, raw?: boolean, notFoundError?: any): Promise<any> {
        return Promise.reject(new Error("[selectOne] is not implemented."));
    }

    /**
     *
     */
    public static selectOneRaw(params?: Object, options?: any, notFoundError?: any): Promise<any> {
        return this.selectOne(params, options, false, notFoundError);
    }

    /**
     *
     */
    public static selectOneOrNew(params?: Object, options?: any): Promise<any> {
        return Promise.reject(new Error("[selectOneOrNew] is not implemented."));
    }

    /**
     *
     */
    public static selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise<any> {
        return Promise.reject(new Error("[selectOneByPk] is not implemented."));
    }

    /**
     *
     */
    public static selectOneByPkRaw(pk: any, notFoundError?: any): Promise<any> {
        return this.selectOneByPk(pk, false, notFoundError);
    }

    /**
     *
     */
    public static selectOneByPkOrNew(pk: any): Promise<any> {
        return Promise.reject(new Error("[selectOneByPkOrNew] is not implemented."));
    }

    /**
     *
     */
    public static insertOne(values: Object, fullResult?: boolean): Promise<any> {
        return Promise.reject(new Error("[insertOne] is not implemented."));
    }

    /**
     *
     */
    public static updateAll(params: Object, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateAll] is not implemented."));
    }

    /**
     *
     */
    public static updateOne(params: Object, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOne] is not implemented."));
    }

    /**
     *
     */
    public static updateOneRaw(params: Object, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneRaw] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPk(pk: any, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneByPk] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPkRaw(pk: any, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneByPkRaw] is not implemented."));
    }

    /**
     *
     */
    public static updateOneUnset(params: Object, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneUnset] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPkUnset(pk: any, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneByPkUnset] is not implemented."));
    }

    /**
     *
     */
    public static updateOneUpsert(params: Object = {}, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneUpsert] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPkUpsert(pk: any, values: Object, options?: Object): Promise<any> {
        return Promise.reject(new Error("[updateOneByPkUpsert] is not implemented."));
    }

    /**
     *
     */
    public static updateOrInsert(params: Object, values: Object, insert: Object): Promise<any> {
        return Promise.reject(new Error("[updateOrInsert] is not implemented."));
    }

    /**
     *
     */
    public static updateOrInsertByPk(pk: any, values: Object, insert: Object): Promise<any> {
        return Promise.reject(new Error("[updateOrInsertByPk] is not implemented."));
    }

    /**
     *
     */
    public static updateOrInsertRaw(params: Object, values: Object, insert: Object): Promise<any> {
        return Promise.reject(new Error("[updateOrInsertRaw] is not implemented."));
    }

    /**
     *
     */
    public static delByPk(pk: string): Promise<any> {
        let temp: any = {
            pk: pk,
        };

        if (this.validatorOnSelectByPk && this.check(this.validatorOnSelectByPk, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByPk);
        }

        return this.deleteOneByPk(temp.pk);
    }

    /**
     *
     */
    public static oneByDocId(id: string, notFoundError?: any): Promise<any> {
        let temp: any = {
            [this.idKey]: id,
        };

        if (this.validatorOnSelectByDocId && this.check(this.validatorOnSelectByDocId, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByDocId);
        }

        return this.selectOneRaw({[this.idKey]: temp[this.idKey]}, {}, notFoundError);
    }

    /**
     *
     */
    public static oneByPk(pk: string, notFoundError?: any): Promise<any> {
        let temp: any = {
            pk: pk,
        };

        if (this.validatorOnSelectByPk && this.check(this.validatorOnSelectByPk, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByPk);
        }

        return this.selectOneByPkRaw(temp.pk, notFoundError);
    }

    /**
     *
     */
    public static updByPk(pk: string, values: any): Promise<any> {
        let temp: any = {
            pk: pk,
        };

        if (this.validatorOnSelectByPk && this.check(this.validatorOnSelectByPk, temp) !== true) {
            return this.checkErrorsPromise(this.validatorOnSelectByPk);
        }

        return this.updateOneByPk(temp.pk, values);
    }

    /**
     * Check of value with custom validator call.
     */
    protected static onCheck(validator: any, value: any): boolean {
        return true;
    }

    /**
     * Get errors of custom validator.
     */
    protected static onCheckGetErrors(validator: any, checkingResult?: any): any {
        return null;
    }

    /**
     * Constructor.
     */
    constructor(values?: any) {
        super();

        if (values) {
            this.assign(values);
        }
    }

    /**
     *
     */
    _() {
        return _;
    }

    /**
     *
     */
    public getId(): any {
        return this.getStaticClass().getDocPk(this);
    }

    /**
     *
     */
    public getStaticClass(): BaseModelStatic {
        return <any> (this.constructor);
    }

    /**
     * Assign set of values.
     */
    public assign(mixed: any) {
        _.extend(this, mixed);

        return this;
    }

    /**
     * Insert record and set new record id.
     */
    public insert(options: {} = {}) {
        return this.getStaticClass().insertOne(
            _.omitBy(this, this.getStaticClass().setDocVersion(this, 1))
        ).then((recordId) => {
            this.getStaticClass().setDocPk(this, recordId);
        });
    }

    /**
     *
     */
    public isNew(): boolean {
        return ! this.getId();
    }

    /**
     *
     */
    public put(options?: Object) {
        return this.getId() ? this.updateVersioned(options) : this.insert(options);
    }

    /**
     *
     */
    public update(options?: Object) {
        return this.getStaticClass().updateOneByPk(
            this.getStaticClass().getDocPk(this),
            _.omitBy(this, _.isUndefined),
            options
        );
    }

    /**
     * Update with a control of the record version ([getDocVersion] method).
     *
     * Record will be updated if the value of version is matching to the value of version in the storage.
     *
     * @param options Low level query options.
     *
     * @returns {Promise}
     */
    public updateVersioned(options: Object = {}) {
        let $class = this.getStaticClass();

        let $id = $class.getDocPk(this);

        $class.unsetDocPk(this);

        // increment doc version or initiate it
        if ($class.getVersionKey()) {
            let $vcUpdate = $class.getDocVersion(this) > 0 ? $class.getDocVersion(this) : void 0;

            if ($class.getDocVersion(this) > 0) {
                $class.setDocVersion(this, $class.getDocVersion(this) + 1);
            } else {
                $class.setDocVersion(this, 1);
            }

            return this.getStaticClass().updateOne(
                $class.setDocPk($class.setDocVersion({}, $vcUpdate), $id),
                _.omitBy(this, _.isUndefined),
                options
            ).then(
                (res: any) => {
                    $class.setDocPk(this, $id);

                    return res;
                },
                (err: any) => {
                    $class.setDocPk(this, $id);

                    return err;
                }
            );
        } else {
            return this.getStaticClass().updateOne(
                $class.setDocPk({}, $id),
                _.omitBy(this, _.isUndefined),
                options
            ).then(
                (res: any) => {
                    $class.setDocPk(this, $id);

                    return res;
                },
                (err: any) => {
                    $class.setDocPk(this, $id);

                    return err;
                }
            );
        }
    }

}

export class BaseModelRelation {

    // left key
    public left: any;

    // right key
    public right: any;

    // type - belongs, has, hasMany
    public type: string;

    constructor(left: any, right: any, type: string) {
        this.left = left;
        this.right = right;
        this.type = type;
    }

}

export class BaseMapper extends BaseModelStatic {

    // id field alias
    public idKey: number|string = "id";

    // primary key field alias
    public pkKey: string|string[] = "?";

    // relations
    public relations: Dict<BaseModelRelation>;

    // validator on select by document id - [id] field
    public validatorOnSelectByDocId: any;

    // validator on select by record id - [_id] field
    public validatorOnSelectByPk: any;

    // [version control] field alias
    public versionKey: string;

    public getDocPk = ModelMongoDb.getDocPk;

    public getDocPkDict = ModelMongoDb.getDocPkDict;

    public getDocVersion = ModelMongoDb.getDocVersion;

    public getIdKey = ModelMongoDb.getIdKey;

    public getPkKey = ModelMongoDb.getPkKey;

    public getVersionKey = ModelMongoDb.getVersionKey;

    public setDocPk = ModelMongoDb.setDocPk;

    public setDocVersion = ModelMongoDb.setDocVersion;

    public unsetDocPk = ModelMongoDb.unsetDocPk;

    public unsetDocVersion = ModelMongoDb.unsetDocVersion;

    public check = ModelMongoDb.check;

    public checkErrorsPromise = ModelMongoDb.checkErrorsPromise;

    public recordId = ModelMongoDb.recordId;

    public relation = ModelMongoDb.relation;

    public deleteAll = ModelMongoDb.deleteAll;

    public deleteOne = ModelMongoDb.deleteOne;

    public deleteOneByPk = ModelMongoDb.deleteOneByPk;

    public selectAll = ModelMongoDb.selectAll;

    public selectAllIn = ModelMongoDb.selectAllIn;

    public selectAllAsArray = ModelMongoDb.selectAllAsArray;

    public selectAllAsArrayIn = ModelMongoDb.selectAllAsArrayIn;

    public selectOne = ModelMongoDb.selectOne;

    public selectOneRaw = ModelMongoDb.selectOneRaw;

    public selectOneOrNew = ModelMongoDb.selectOneOrNew;

    public selectOneByPk = ModelMongoDb.selectOneByPkRaw;

    public selectOneByPkRaw = ModelMongoDb.selectOneByPkRaw;

    public selectOneByPkOrNew = ModelMongoDb.selectOneByPkOrNew;

    public insertOne = ModelMongoDb.insertOne;

    public updateAll = ModelMongoDb.updateAll;

    public updateOne = ModelMongoDb.updateOne;

    public updateOneRaw = ModelMongoDb.updateOneRaw;

    public updateOneByPk = ModelMongoDb.updateOneByPk;

    public updateOneByPkRaw = ModelMongoDb.updateOneByPkRaw;

    public updateOneUnset = ModelMongoDb.updateOneUnset;

    public updateOneByPkUnset = ModelMongoDb.updateOneByPkUnset;

    public updateOneUpsert = ModelMongoDb.updateOneUpsert;

    public updateOneByPkUpsert = ModelMongoDb.updateOneByPkUpsert;

    public updateOrInsert = ModelMongoDb.updateOrInsert;

    public updateOrInsertByPk = ModelMongoDb.updateOrInsertByPk;

    public updateOrInsertRaw = ModelMongoDb.updateOrInsertRaw;

    public delByPk = ModelMongoDb.delByPk;

    public oneByDocId = ModelMongoDb.oneByDocId;

    public oneByPk = ModelMongoDb.oneByPk;

    public updByPk = ModelMongoDb.updByPk;

    protected onCheck(validator: any, value: any): boolean {
        return true;
    }

    protected onCheckGetErrors(validator: any, checkingResult?: any): any {
        return null;
    }

}
