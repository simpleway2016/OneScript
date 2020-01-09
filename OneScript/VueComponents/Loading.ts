import { Component } from "../Component";
import Vue from "vue";
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
export function registerLoading( tagName: string = "loading") {
    if (registered)
        return;
    registered = true;

    //注册Vue组件
    Vue.component(tagName, {
        template: Component.requireHtml(html, <any>{ constructor: { name: "OneScript_Components_Loading" } }),
        props: {
            "color": {
                default:"#f1b748"
            },
            "coloropacity": {
                default: 0.9
            },
            "bgcolor": {
                default: "rgba(0,0,0,0.2)"
            },
            "bgcoloropacity": {
                default: 0.5
            }},
    });
}