
import {BaseModelMongoDb} from "../src/base_model_mongodb";
import {mongodbConnection} from "./bootstrap";
import * as mongodb from "mongodb";

class MockA extends BaseModelMongoDb {

    protected static collection = "mock_a";

    protected static db = mongodbConnection;

    protected static pkKey: string = "ida";

}

class MockB extends BaseModelMongoDb {

    protected static collection = "mock_b";

    protected static db = mongodbConnection;

    protected static pkKey: string = "idb";

}

describe("MongoDb", () => {

    describe("model class", () => {
        it("should generate pk selector on pk defined as string and pk value defined as string", () => {
            let sel: any = MockA.pkOrCond("56bf7aa030042aff3e9c9339");

            expect("ida" in sel).toBeTruthy();

            expect(sel.ida instanceof mongodb.ObjectId).toBeTruthy();

            expect(sel.ida.toHexString()).toBe(new mongodb.ObjectId("56bf7aa030042aff3e9c9339").toHexString());
        });

        it("should generate pk selector on pk defined as string and pk value defined as ObjectId", () => {
            let sel: any = MockB.pkOrCond(new mongodb.ObjectId("56bf7aa030042aff3e9c9339"));

            expect("idb" in sel).toBeTruthy();

            expect(sel.idb instanceof mongodb.ObjectId).toBeTruthy();

            expect(sel.idb.toHexString()).toBe(new mongodb.ObjectId("56bf7aa030042aff3e9c9339").toHexString());
        });

        it("should generate pk selector with initial condition if condition defined as complex object", () => {
            expect(MockB.pkOrCond({a: 123})).toEqual({a: 123});
        });
    });

    it("db", (done) => {
        MockA.insertOne({a: 1}).then(
            (r) => {
                expect(true).toBe(1);

                console.log(r);

                done();
            }
        ).catch(
            (r) => {
                expect(true).toBe(2);

                console.log(r);

                done();
            }
        );

        let MockC = MockA.clone("123");

        setTimeout(() => {
            console.log(MockA.selectOne, MockC.selectOne);
        }, 3000);

        MockB.insertOne({a: 2}).then(
            (r) => {
                expect(true).toBe(1);

                console.log(r);

                done();
            }
        ).catch(
            (r) => {
                expect(true).toBe(2);

                console.log(r);

                done();
            }
        );
    });

});
