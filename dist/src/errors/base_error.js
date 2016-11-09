"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseError = (function (_super) {
    __extends(BaseError, _super);
    function BaseError(mixed) {
        _super.call(this, message);
        this.name = "BaseError";
        this.message = message;
    }
    return BaseError;
}(Error));
exports.BaseError = BaseError;
