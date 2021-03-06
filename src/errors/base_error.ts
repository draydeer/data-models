///<reference path="../../typings/index.d.ts"/>
export class BaseError extends Error {

    public message: any;

    public name: string = "BaseError";

    constructor(message?: any) {
        super(message);

        this.message = message;
    }

}
