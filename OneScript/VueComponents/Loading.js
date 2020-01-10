"use strict";
exports.__esModule = true;
var Component_1 = require("../Component");
var vue_1 = require("vue");
var html = require("./loading.html");
var registered = false;
/**
 * 注册loading组件，组件属性：
 * color : 颜色，默认 #f1b748
 * bgcolor : 背景色，默认 #fff
 * coloropacity: 颜色透明度，默认0.9
 * bgcoloropacity: 颜色透明度，默认0.5
 * @param tagName html标签名字，默认<loading>
 */
function registerLoading(tagName) {
    if (tagName === void 0) { tagName = "loading"; }
    if (registered)
        return;
    registered = true;
    //注册Vue组件
    vue_1["default"].component(tagName, {
        template: Component_1.Component.requireHtml(html, { constructor: { name: "OneScript_Components_Loading" } }),
        props: {
            "color": {
                "default": "#f1b748"
            },
            "coloropacity": {
                "default": 0.9
            },
            "bgcolor": {
                "default": "rgba(0,0,0,0.2)"
            },
            "bgcoloropacity": {
                "default": 0.5
            }
        }
    });
}
exports.registerLoading = registerLoading;
