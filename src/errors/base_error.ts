///<reference path="../../typings/index.d.ts"/>
export class BaseError extends Error {

    public name: string = "BaseError";

    constructor(mixed?: any) {
        super(mixed);
    }

}
