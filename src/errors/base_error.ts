///<reference path="../../typings/index.d.ts"/>
export class BaseError extends Error {

    public message: any;

    public name: string = "BaseError";

    constructor(mixed?: any) {
        super(message);

        this.message = message;
    }

}
