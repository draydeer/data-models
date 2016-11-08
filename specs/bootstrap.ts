
import {MongoClient} from "mongodb";

export let mongodbConnection = () => {
    return new Promise((rs, rj) => {
        MongoClient.connect('mongodb://localhost:27017/test_models', (err, db) => {
            mongodbConnection = () => Promise.resolve(db);

            rs(db);
        });
    });
};
