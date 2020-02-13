import { Component } from "../Component";
import Vue from "vue";
var html = require("./loading.html");
var registered = false;

export interface LoadingOption {
    /**底部样式*/
    bgclass?: string;
    /**旋转体样式 */
    bodyclass?: string;
}

export function registerLoading(option: LoadingOption , tagName: string = "loading") {
    if (registered)
        return;
    registered = true;

    var myOption: LoadingOption = {
        bgclass: "",
        bodyclass:""
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
            "bgclass": {
                default: myOption.bgclass
            },
            "bodyclass": {
                default: myOption.bodyclass
            }
        }
    });
}