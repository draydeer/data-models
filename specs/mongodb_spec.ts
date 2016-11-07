
import {BaseModelMongoDb} from "../src/base_model_mongodb";
import * as mongodb from "mongodb";

class MockA extends BaseModelMongoDb {

    protected static pkKey: string = "ida";

}

class MockB extends BaseModelMongoDb {

    protected static pkKey: string = "idb";

}

describe("MongoDb", () => {

    describe("model class", () => {
        it("should generate pk selector on pk defined as string and pk value defined as string", () => {
            let sel: any = MockA.pkOrConditionDict("56bf7aa030042aff3e9c9339");

            expect("ida" in sel).toBeTruthy();

            expect(sel.ida instanceof mongodb.ObjectId).toBeTruthy();

            expect(sel.ida.toHexString()).toBe(new mongodb.ObjectId("56bf7aa030042aff3e9c9339").toHexString());
        });

        it("should generate pk selector on pk defined as string and pk value defined as ObjectId", () => {
            let sel: any = MockB.pkOrConditionDict(new mongodb.ObjectId("56bf7aa030042aff3e9c9339"));

            expect("idb" in sel).toBeTruthy();

            expect(sel.idb instanceof mongodb.ObjectId).toBeTruthy();

            expect(sel.idb.toHexString()).toBe(new mongodb.ObjectId("56bf7aa030042aff3e9c9339").toHexString());
        });

        it("should generate pk selector with initial condition if condition defined as complex object", () => {
            expect(MockB.pkOrConditionDict({a: 123})).toEqual({a: 123});
        });
    });

});
