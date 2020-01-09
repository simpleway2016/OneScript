var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import Vue from "vue";
import { Component } from "../Component";
var html = require("./selectorTest.html");
var SelectorTest = /** @class */ (function (_super) {
    __extends(SelectorTest, _super);
    function SelectorTest() {
        var _this = _super.call(this, html) || this;
        _this.model = {
            options: [],
            selectedText: undefined,
            selectedValue: undefined,
        };
        for (var i = 0; i < 30; i++) {
            _this.model.options.push({
                text: "Option " + (i + 1),
                value: i + 1,
            });
        }
        _this.vm = new Vue({
            el: _this.getViewModelElement(),
            data: _this.model,
            methods: _this.getMethodObjectForVue(),
            watch: {
                selectedValue: function (newvalue) {
                    _this.model.selectedText = _this.model.options.find(function (m) { return m.value == newvalue; }).text;
                }
            },
        });
        return _this;
    }
    return SelectorTest;
}(Component));
export { SelectorTest };
//# sourceMappingURL=SelectorTest.js.map