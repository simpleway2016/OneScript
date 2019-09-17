import { Component } from "../Component";
import Vue from "vue";
var html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title></title>
    <style>
        .ani {
            transform-origin: 50% 50%;
            animation: _onescript_loading_keyframe 2s linear infinite;
            -moz-animation: _onescript_loading_keyframe 2s linear infinite; /* Firefox */
            -webkit-animation: _onescript_loading_keyframe 2s linear infinite; /* Safari 和 Chrome */
            -o-animation: _onescript_loading_keyframe 2s linear infinite; /* Opera */
        }
        @keyframes _onescript_loading_keyframe {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        @-moz-keyframes _onescript_loading_keyframe {
            from {
                -moz-transform: rotate(0deg);
            }

            to {
                -moz-transform: rotate(360deg);
            }
        }

        @-webkit-keyframes _onescript_loading_keyframe {
            from {
                -webkit-transform: rotate(0deg);
            }

            to {
                -webkit-transform: rotate(360deg);
            }
        }

        @-o-keyframes _onescript_loading_keyframe {
            from {
                -o-transform: rotate(0deg);
            }

            to {
                -o-transform: rotate(360deg);
            }
        }
    </style>
</head>
<body>
    <svg style="width:100%;height:100%;" viewBox="0 0 100 100">
        <rect width="80" height="80" rx="40" ry="40" x="10" y="10" fill="none" v-bind:stroke="bgcolor" v-bind:opacity="bgcoloropacity" stroke-width="15"></rect>
        <rect class="ani" width="80" height="80" rx="40" ry="40" x="10" y="10" fill="none" v-bind:stroke="color" v-bind:opacity="coloropacity" stroke-width="15" stroke-dasharray="40,800"></rect>
    </svg>
</body>
</html>
`;
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