"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var base_model_1 = require("./base_model");
var BaseModelRest = (function (_super) {
    __extends(BaseModelRest, _super);
    function BaseModelRest() {
        _super.apply(this, arguments);
    }
    return BaseModelRest;
}(base_model_1.BaseModel));
exports.BaseModelRest = BaseModelRest;
