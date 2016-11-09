declare module "data-models" {
	export class BaseError extends Error {
		name: string;
		constructor(mixed?: any);
	}
	export class BadParameterError extends BaseError {
		name: string;
	}
	export class InternalError extends BaseError {
		name: string;
	}
	import { EventEmitter } from "events";
	import * as _ from "lodash";
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
	export class BaseModel extends EventEmitter {
		protected static idKey: number | string;
		protected static pkKey: string | string[];
		protected static versionKey: string;
		protected static relations: Dict<BaseModelRelation>;
		protected static source: string;
		protected static validatorOnSelectByDocId: any;
		protected static validatorOnSelectByPk: any;
		/**
		 * Get document primary key value.
		 */
		static getDocPk(doc: Data, wantNull?: boolean): any;
		/**
		 * Get document primary key value as associated value of dictionary.
		 */
		static getDocPkDict(doc: Data, wantNull?: boolean): any;
		/**
		 * Get document version.
		 */
		static getDocVersion(doc: Data): number;
		/**
		 *
		 */
		static getIdKey(): any;
		/**
		 *
		 */
		static getPkKey(): any;
		/**
		 *
		 */
		static getVersionKey(): any;
		/**
		 * Set document primary key value.
		 */
		static setDocPk(doc: Data, pk: any): any;
		/**
		 * Set document version.
		 */
		static setDocVersion(doc: any, version: number): any;
		/**
		 * Unset document primary key value.
		 */
		static unsetDocPk(doc: any): any;
		/**
		 * Unset document version.
		 */
		static unsetDocVersion(doc: any): any;
		/**
		 * Check given arguments with validator.
		 */
		static check(validator: any, value: any): any;
		/**
		 * Create [BadParameterError] instance with errors from validator.
		 */
		static checkErrorsPromise(validator: any): Promise<any>;
		/**
		 * Prepare specified to the storage engine record id.
		 */
		static recordId(recordId: any): any;
		/**
		 *
		 */
		static relation(left: any, right: any, type: string): BaseModelRelation;
		/**
		 *
		 */
		static deleteAll(params?: Data, options?: any): Promise<any>;
		/**
		 *
		 */
		static deleteOne(params?: Data, options?: any): Promise<any>;
		/**
		 *
		 */
		static deleteOneByPk(pk: any): Promise<any>;
		/**
		 *
		 */
		static selectAll(params?: Data, options?: any): Promise<any>;
		/**
		 * Select all performing [in] values search.
		 */
		static selectAllIn(key: string, inList: any[], options?: any): Promise<any>;
		/**
		 *
		 */
		static selectAllAsArray(params?: Data, options?: any, raw?: boolean): Promise<any>;
		/**
		 * Select all as array performing [in] values search.
		 */
		static selectAllAsArrayIn(key: string, inList: any[], options?: any, raw?: boolean): Promise<any>;
		/**
		 *
		 */
		static selectOne(params?: Data, options?: any, raw?: boolean, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneRaw(params?: Data, options?: any, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneOrNew(params?: Data, options?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneByPkRaw(pk: any, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneByPkOrNew(pk: any): Promise<any>;
		/**
		 *
		 */
		static insertOne(values: Data, fullResult?: boolean): Promise<any>;
		/**
		 *
		 */
		static updateAll(params: Data, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOne(params: Data, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneRaw(params: Data, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneByPk(pk: any, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneByPkRaw(pk: any, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneUnset(params: Data, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneByPkUnset(pk: any, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneUpsert(params: Data, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOneByPkUpsert(pk: any, values: Data, options?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOrInsert(params: Data, values: Data, insert: Data): Promise<any>;
		/**
		 *
		 */
		static updateOrInsertByPk(pk: any, values: Data, insert: Data): Promise<any>;
		/**
		 *
		 */
		static updateOrInsertRaw(params: Data, values: Data, insert: Data): Promise<any>;
		/**
		 *
		 */
		static delByPk(pk: string): Promise<any>;
		/**
		 *
		 */
		static oneByDocId(id: string, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static oneByPk(pk: string, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updByPk(pk: string, values: any): Promise<any>;
		/**
		 * Check of value with custom validator call.
		 */
		protected static onCheck(validator: any, value: any): boolean;
		/**
		 * Get errors of custom validator.
		 */
		protected static onCheckGetErrors(validator: any, checkingResult?: any): any;
		/**
		 * Constructor.
		 */
		constructor(values?: any);
		/**
		 *
		 */
		_(): _.LoDashStatic;
		/**
		 *
		 */
		getId(): any;
		/**
		 *
		 */
		getStaticClass(): BaseModelStatic;
		/**
		 * Assign set of values.
		 */
		assign(mixed: any): this;
		/**
		 * Insert record and set new record id.
		 */
		insert(options?: {}): Promise<void>;
		/**
		 *
		 */
		isNew(): boolean;
		/**
		 *
		 */
		put(options?: {}): Promise<any>;
		/**
		 *
		 */
		update(options?: {}): Promise<any>;
		/**
		 * Update with a control of the record version ([getDocVersion] method).
		 *
		 * Record will be updated if the value of version is matching to the value of version in the storage.
		 *
		 * @param options Low level query options.
		 *
		 * @returns {Promise}
		 */
		updateVersioned(options?: {}): Promise<any>;
	}
	export class BaseModelRelation {
		left: any;
		right: any;
		type: string;
		constructor(left: any, right: any, type: string);
	}
	export class BaseModelKnex extends BaseModel {
		/**
		 * Prepare cursor [where] conditions in mongo-like syntax.
		 *
		 * @param cursor Cursor object.
		 * @param where Where conditions.
		 * @param cb Callback to return stream object. If not provided query result will be fetched entirely (usable for single documents).
		 *
		 * @returns {any}
		 */
		static getCursorWhere(cursor: any, where: any, cb?: (stream: any) => void): any;
	}

	export class NotFoundError extends BaseError {
		name: string;
	}
	export class BaseModelMongoDb extends BaseModel {
		protected static collection: string;
		protected static db: any;
		protected static pkKey: string;
		protected static versionKey: string;
		/**
		 * Get MongoDb collection object reference.
		 */
		static getCollection(alias?: string): any;
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
		static pkOrCond(condition: any): any;
		/**
		 *
		 */
		static recordId(recordId: any): any;
		/**
		 *
		 */
		static deleteAll(params?: Data, opts?: any): Promise<any>;
		/**
		 *
		 */
		static deleteOne(params?: Data, opts?: any, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static deleteOneByPk(pk: any, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectAll(params?: Data, opts?: any): Promise<any>;
		/**
		 *
		 */
		static selectAllAsArray(params?: Data, opts?: any, raw?: boolean): Promise<any>;
		/**
		 *
		 */
		static selectOne(params?: Data, opts?: any, raw?: boolean, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneOrNew(params?: Data, opts?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneByPk(pk: any, raw?: boolean, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static selectOneByPkOrNew(pk: any): Promise<any>;
		/**
		 *
		 */
		static insertOne(values: Data, fullResult?: boolean): Promise<any>;
		/**
		 *
		 */
		static updateAll(params: Data, values: Data, opts?: Data): Promise<any>;
		/**
		 *
		 */
		static updateOne(params: Data, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneRaw(params: Data, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneByPk(pk: any, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneByPkRaw(pk: any, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneUnset(params: Data, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneByPkUnset(pk: any, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneUpsert(params: Data, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOneByPkUpsert(pk: any, values: Data, opts?: Data, notFoundError?: any): Promise<any>;
		/**
		 *
		 */
		static updateOrInsert(params: Data, values: Data, insert: Data): Promise<any>;
		/**
		 *
		 */
		static updateOrInsertByPk(pk: any, values: Data, insert: Data): Promise<any>;
		/**
		 *
		 */
		static updateOrInsertRaw(params: Data, values: Data, insert: Data): Promise<any>;
	}
	export class BaseModelOrientJs extends BaseModel {
	}
	export class BaseModelRest extends BaseModel {
	}
	export let ModelKnex: typeof BaseModelKnex;
	export let ModelMongoDb: typeof BaseModelMongoDb;
	export let ModelOrientJs: typeof BaseModelOrientJs;
	export let ModelRest: typeof BaseModelRest;
}
