import { Component } from "../Component";
import Vue from "vue";
var html = "\n<!DOCTYPE html>\n<html>\n<head>\n    <meta charset=\"utf-8\" />\n    <title></title>\n    <style>\n        .ani {\n            transform-origin: 50% 50%;\n            animation: _onescript_loading_keyframe 2s linear infinite;\n            -moz-animation: _onescript_loading_keyframe 2s linear infinite; /* Firefox */\n            -webkit-animation: _onescript_loading_keyframe 2s linear infinite; /* Safari \u548C Chrome */\n            -o-animation: _onescript_loading_keyframe 2s linear infinite; /* Opera */\n        }\n        @keyframes _onescript_loading_keyframe {\n            from {\n                transform: rotate(0deg);\n            }\n\n            to {\n                transform: rotate(360deg);\n            }\n        }\n\n        @-moz-keyframes _onescript_loading_keyframe {\n            from {\n                -moz-transform: rotate(0deg);\n            }\n\n            to {\n                -moz-transform: rotate(360deg);\n            }\n        }\n\n        @-webkit-keyframes _onescript_loading_keyframe {\n            from {\n                -webkit-transform: rotate(0deg);\n            }\n\n            to {\n                -webkit-transform: rotate(360deg);\n            }\n        }\n\n        @-o-keyframes _onescript_loading_keyframe {\n            from {\n                -o-transform: rotate(0deg);\n            }\n\n            to {\n                -o-transform: rotate(360deg);\n            }\n        }\n    </style>\n</head>\n<body>\n    <svg style=\"width:100%;height:100%;\" viewBox=\"0 0 100 100\">\n        <rect width=\"80\" height=\"80\" rx=\"40\" ry=\"40\" x=\"10\" y=\"10\" fill=\"none\" v-bind:stroke=\"bgcolor\" v-bind:opacity=\"bgcoloropacity\" stroke-width=\"15\"></rect>\n        <rect class=\"ani\" width=\"80\" height=\"80\" rx=\"40\" ry=\"40\" x=\"10\" y=\"10\" fill=\"none\" v-bind:stroke=\"color\" v-bind:opacity=\"coloropacity\" stroke-width=\"15\" stroke-dasharray=\"40,800\"></rect>\n    </svg>\n</body>\n</html>\n";
var registered = false;
/**
 * 注册loading组件，组件属性：
 * color : 颜色，默认 #f1b748
 * bgcolor : 背景色，默认 #fff
 * coloropacity: 颜色透明度，默认0.9
 * bgcoloropacity: 颜色透明度，默认0.5
 * @param tagName html标签名字，默认<loading>
 */
export function registerLoading(tagName) {
    if (tagName === void 0) { tagName = "loading"; }
    if (registered)
        return;
    registered = true;
    //注册Vue组件
    Vue.component(tagName, {
        template: Component.requireHtml(html, { constructor: { name: "OneScript_Components_Loading" } }),
        props: {
            "color": {
                default: "#f1b748"
            },
            "coloropacity": {
                default: 0.9
            },
            "bgcolor": {
                default: "rgba(0,0,0,0.2)"
            },
            "bgcoloropacity": {
                default: 0.5
            }
        },
    });
}
//# sourceMappingURL=Loading.js.map