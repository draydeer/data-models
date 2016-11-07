
import {BaseModel} from "./base_model";

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
    public static getCursorWhere(cursor: any, where: any, cb?: (stream: any) => void) {
        if (this._().isEmpty(where) === false) {
            let paramIndex = 100;

            for (let key in where) {
                if (where.hasOwnProperty(key)) {
                    if (key === "$or") {
                        // cur.orWhere(k, where["$or"]);

                        delete where.$or;

                        continue;
                    }

                    if (this._().isObject(where[key])) {
                        let w = where[key];

                        if ("$gt" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, ">", w.$gt);
                        }

                        if ("$gte" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, ">=", w.$gte);
                        }

                        if ("$in" in w) {
                            paramIndex ++;

                            cursor.whereIn(key, w.$in);
                        }

                        if ("$is" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, "IS", w.$is);
                        }

                        if ("$like" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, "LIKE", w.$like);
                        }

                        if ("$lt" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, "<", w.$lt);
                        }

                        if ("$lte" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, "<=", w.$lte);
                        }

                        if ("$ne" in w) {
                            paramIndex ++;

                            cursor.andWhere(key, "<>", w.$ne);
                        }
                    } else {
                        paramIndex ++;

                        cursor.andWhere(key, where[key]);
                    }
                }
            }
        }

        return cb ? cursor.stream(cb) : this.getDb().raw(cursor.toString());
    }

}
