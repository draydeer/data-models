"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_error_1 = require("./base_error");
var InternalError = (function (_super) {
    __extends(InternalError, _super);
    function InternalError() {
        _super.apply(this, arguments);
        this.name = "InternalError";
    }
    return InternalError;
}(base_error_1.BaseError));
exports.InternalError = InternalError;
//# sourceMappingURL=internal_error.js.map