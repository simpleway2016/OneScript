import { Component } from "../Component";
import Vue from "vue";
var html = require("./loading.html");
var registered = false;

export interface LoadingOption {
    /**颜色 默认#f1b748*/
    color?: string;
    /**颜色透明度，默认0.9 */
    coloropacity?: number;
    /**背景色 默认rgba(0,0,0,0.2) */
    bgcolor?: string;
    /**颜色透明度，默认0.5 */
    bgcoloropacity?: number;
}

/**
 * 注册loading组件，组件属性：
 * color : 颜色，默认 #f1b748
 * bgcolor : 背景色，默认 #fff
 * coloropacity: 颜色透明度，默认0.9
 * bgcoloropacity: 颜色透明度，默认0.5
 * @param tagName html标签名字，默认<loading>
 */
export function registerLoading(option: LoadingOption , tagName: string = "loading") {
    if (registered)
        return;
    registered = true;

    var myOption: LoadingOption = {
        color:"#f1b748",
        coloropacity: 0.9,
        bgcolor: "rgba(0,0,0,0.2)",
        bgcoloropacity: 0.5
    };
    if (option) {
        for (var p in option) {
            var val = option[p];
            if (typeof val !== "undefined") {
                myOption[p] = val;
            }
        }
    }


    //注册Vue组件
    Vue.component(tagName, {
        template: Component.requireHtml(html, <any>{ constructor: { name: "OneScript_Components_Loading" } }),
        props: {
            "color": {
                default: myOption.color
            },
            "coloropacity": {
                default: myOption.coloropacity
            },
            "bgcolor": {
                default: myOption.bgcolor
            },
            "bgcoloropacity": {
                default: myOption.bgcoloropacity
            }},
    });
}