import { BaseModel } from "./base_model";
export declare class BaseModelKnex extends BaseModel {
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
