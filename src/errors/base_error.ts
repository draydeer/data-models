
declare class Error {

    public message: any;

    public name: string;

    public stack: string;

    constructor(message?: any);

}

export class BaseError extends Error {

    public name: string = "BaseError";

    constructor(mixed?: any) {
        super(mixed);
    }

}
