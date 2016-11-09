///<reference path="../typings/index.d.ts"/>
import {BadParameterError} from "./errors/bad_parameter_error";
import {EventEmitter} from "events";
import * as _ from "lodash";
import {InternalError} from "./errors/internal_error";

export type Dict<T> = _.Dictionary<T>;

export type Data = Dict<any>;

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

    deleteAll(params?: Data, options?: any): Promise<any>;

    deleteOne(params?: Data, options?: any): Promise<any>;

    deleteOneByPk(pk: any): Promise<any>;

    selectAll(params?: Data, options?: any): Promise<any>;

    selectAllIn(key: string, inList: any[], options?: any): Promise<any>;

    selectAllAsArray(params?: Data, options?: any, raw?: boolean): Promise<any>;

    selectAllAsArrayIn(key: string, inList: any[], options?: any, raw?: boolean): Promise<any>;

    selectOne(params?: Data, options?: any, raw?: boolean, notFoundError?: any): Promise<any>;

    selectOneRaw(params?: Data, options?: any, notFoundError?: any): Promise<any>;

    selectOneOrNew(params?: Data, options?: any): Promise<any>;

    selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise<any>;

    selectOneByPkRaw(pk: any, notFoundError?: any): Promise<any>;

    selectOneByPkOrNew(pk: any): Promise<any>;

    insertOne(values: Data, fullResult?: boolean): Promise<any>;

    updateAll(params: Data, values: Data, options?: Data): Promise<any>;

    updateOne(params: Data, values: Data, options?: Data): Promise<any>;

    updateOneRaw(params: Data, values: Data, options?: Data): Promise<any>;

    updateOneByPk(pk: any, values: Data, options?: Data): Promise<any>;

    updateOneByPkRaw(pk: any, values: Data, options?: Data): Promise<any>;

    updateOneUnset(params: Data, values: Data, options?: Data): Promise<any>;

    updateOneByPkUnset(pk: any, values: Data, options?: Data): Promise<any>;

    updateOneUpsert(params: Data, values: Data, options?: Data): Promise<any>;

    updateOneByPkUpsert(pk: any, values: Data, options?: Data): Promise<any>;

    updateOrInsert(params: Data, values: Data, insert: Data): Promise<any>;

    updateOrInsertByPk(pk: any, values: Data, insert: Data): Promise<any>;

    updateOrInsertRaw(params: Data, values: Data, insert: Data): Promise<any>;

}

function getDocPkComplex(doc: Data, pk: string[], wantNull?: boolean): Data {
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

function getDocPkSimple(doc: Data, pk: string, wantNull?: boolean): any {
    return pk in doc[pk] ? doc[pk] : (wantNull ? null : doc[pk]);
}

function setDocPkComplex(doc: Data, pk: string[], pkValue: Data): Data {
    let result = getDocPkComplex(pkValue, pk, true);

    if (result) {
        for (let i = pk.length; i > 0; i --) {
            doc[pk[i]] = result[pk[i]];
        }
    }

    return doc;
}

function setDocPkSimple(doc: Data, pk: string, pkValue: any): any {
    doc[pk] = pkValue;

    return doc;
}

function unsetDocPkComplex(doc: Data, pk: string[]): any {
    _.each(pk, (key: string) => delete doc[key]);

    return doc;
}

function unsetDocPkSimple(doc: Data, pk: string): any {
    delete doc[pk];

    return doc;
}

function setDocPkClassAccessors(cls: any, pk: string|string[]): any {
    if (_.isArray(pk)) {
        cls.getDocPk = (d: Data, n?: boolean) => getDocPkComplex(d, <string[]> pk, n);

        cls.getDocPkDict = (d: Data, n?: boolean) => getDocPkComplex(d, <string[]> pk, n);

        cls.setDocPk = (d: Data, v?: any) => setDocPkComplex(d, <string[]> pk, v);

        cls.unsetDocPk = (d: Data) => unsetDocPkComplex(d, <string[]> pk);
    } else if (_.isString(pk)) {
        cls.getDocPk = (d: Data, n?: boolean) => getDocPkSimple(d, <string> pk);

        cls.getDocPkDict = (d: Data, n?: boolean) => ({[<string> pk]: getDocPkSimple(d, <string> pk)});

        cls.setDocPk = (d: Data, v?: any) => setDocPkSimple(d, <string> pk, v);

        cls.unsetDocPk = (d: Data) => unsetDocPkSimple(d, <string> pk);
    } else {
        throw new InternalError("Pk value must be a string or an array of strings.");
    }

    return cls;
}

export class BaseModel extends EventEmitter {

    // id field alias
    protected static idKey: number|string = "id";

    // primary key field alias
    protected static pkKey: string|string[] = "?";

    // [version control] field alias
    protected static versionKey: string;

    // relations
    protected static relations: Dict<BaseModelRelation>;

    // active storage source such as collection
    protected static source: string;

    // validator on select by document id - [id] field
    protected static validatorOnSelectByDocId: any;

    // validator on select by record id - [_id] field
    protected static validatorOnSelectByPk: any;

    /**
     * Get document primary key value.
     */
    public static getDocPk(doc: Data, wantNull?: boolean): any {
        return setDocPkClassAccessors(this, this.pkKey).getDocPk(doc, wantNull);
    }

    /**
     * Get document primary key value as associated value of dictionary.
     */
    public static getDocPkDict(doc: Data, wantNull?: boolean): any {
        return setDocPkClassAccessors(this, this.pkKey).getDocPkDict(doc, wantNull);
    }

    /**
     * Get document version.
     */
    public static getDocVersion(doc: Data): number {
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
    public static setDocPk(doc: Data, pk: any): any {
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
    public static deleteAll(params?: Data, options?: any): Promise<any> {
        return Promise.reject(new Error("[deleteAll] is not implemented."));
    }

    /**
     *
     */
    public static deleteOne(params?: Data, options?: any): Promise<any> {
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
    public static selectAll(params?: Data, options?: any): Promise<any> {
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
    public static selectAllAsArray(params?: Data, options?: any, raw?: boolean): Promise<any> {
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
    public static selectOne(params?: Data, options?: any, raw?: boolean, notFoundError?: any): Promise<any> {
        return Promise.reject(new Error("[selectOne] is not implemented."));
    }

    /**
     *
     */
    public static selectOneRaw(params?: Data, options?: any, notFoundError?: any): Promise<any> {
        return this.selectOne(params, options, false, notFoundError);
    }

    /**
     *
     */
    public static selectOneOrNew(params?: Data, options?: any): Promise<any> {
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
    public static insertOne(values: Data, fullResult?: boolean): Promise<any> {
        return Promise.reject(new Error("[insertOne] is not implemented."));
    }

    /**
     *
     */
    public static updateAll(params: Data, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateAll] is not implemented."));
    }

    /**
     *
     */
    public static updateOne(params: Data, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOne] is not implemented."));
    }

    /**
     *
     */
    public static updateOneRaw(params: Data, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneRaw] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPk(pk: any, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneByPk] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPkRaw(pk: any, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneByPkRaw] is not implemented."));
    }

    /**
     *
     */
    public static updateOneUnset(params: Data, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneUnset] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPkUnset(pk: any, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneByPkUnset] is not implemented."));
    }

    /**
     *
     */
    public static updateOneUpsert(params: Data = {}, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneUpsert] is not implemented."));
    }

    /**
     *
     */
    public static updateOneByPkUpsert(pk: any, values: Data, options?: Data): Promise<any> {
        return Promise.reject(new Error("[updateOneByPkUpsert] is not implemented."));
    }

    /**
     *
     */
    public static updateOrInsert(params: Data, values: Data, insert: Data): Promise<any> {
        return Promise.reject(new Error("[updateOrInsert] is not implemented."));
    }

    /**
     *
     */
    public static updateOrInsertByPk(pk: any, values: Data, insert: Data): Promise<any> {
        return Promise.reject(new Error("[updateOrInsertByPk] is not implemented."));
    }

    /**
     *
     */
    public static updateOrInsertRaw(params: Data, values: Data, insert: Data): Promise<any> {
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
    public put(options?: {}) {
        return this.getId() ? this.updateVersioned(options) : this.insert(options);
    }

    /**
     *
     */
    public update(options?: {}) {
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
    public updateVersioned(options: {} = {}) {
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
