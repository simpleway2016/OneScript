import { Component } from "../Component";
import Vue from "vue";

var html = require("./alertWindow.html");

export interface AlertWindowButton {
    text: string;
    /**文字样式 */
    textClass?: string;
    /**是否粗体 */
    bold?: boolean;
    /**点击回调 */
    click?: () => void;
}
export interface AlertWindowOption {
    /**主显示框的样式 */
    boxclass?: string;
    /**标题 */
    title?: string;
    /**标题文字的样式 */
    titleclass?: string;
    /**内容的样式 */
    contentclass?: string;
    buttons?: AlertWindowButton[];
}

export function registerAlertWindow(tagname: string,option: AlertWindowOption) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_AlertWindow" } };

    var myhtml = Component.requireHtml(html, mycomponent);
    var rootClassName = (<any>mycomponent).constructor._onescriptClassName;

    var myOption: AlertWindowOption = {
        boxclass: "jack-one-script-alertwindow-box",
        titleclass: "jack-one-script-alertwindow-title",
        contentclass: "jack-one-script-alertwindow-content",
        buttons: [
            {
                text: "OK",
                textClass: "",
                bold: true
            }
        ],

    };
    if (option) {
        for (var p in option) {
            var val = option[p];
            if (typeof val !== "undefined") {
                myOption[p] = val;
            }
        }
    }

    Vue.component(tagname, {
        template: myhtml,
        data: function () {
            return {
                bodyHeight:0
            };
        },
        model: {
            prop: 'visible',
            event: 'change'
        },
        props: {
            boxclass: {
                type: String,
                default: myOption.boxclass
            },
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: myOption.title
            },
            titleclass: {
                type: String,
                default: myOption.titleclass
            },
            contentclass: {
                type: String,
                default: myOption.contentclass
            },
            buttons: {
                type: Array,
                default: myOption.buttons
            },
        },
        methods: {
            getBodyHeight: function () {
                //测算
                try {
                    this.bodyHeight = window.innerHeight * 0.9 - this.layerEle.querySelector("#divTitle").getBoundingClientRect().height - this.layerEle.querySelector("#divButtonContainer").getBoundingClientRect().height
                } catch (e) {
                    this.bodyHeight = window.innerHeight * 0.65 ;
                }

            },
            btnClick: function (btn) {
                this.$emit('change', false);

                if (btn.click && typeof btn.click === "function") {
                    btn.click();
                }
            }
        },
        watch: {
            
        },
        beforeMount: function () {
            this.getBodyHeight();
        },
        mounted: function () {
            var layerEle: HTMLElement = this.$el.querySelector("#layer");
            layerEle.parentElement.removeChild(layerEle);
            //给layerEle设置根部样式，这样，html <header> 里面的style才能作用到layerEle上
            layerEle.className = rootClassName + " " + layerEle.className;
            document.body.appendChild(layerEle);
            this.layerEle = layerEle;

            window.addEventListener("resize", this.getBodyHeight, false);
        },
        destroyed: function () {
            window.removeEventListener("resize", this.getBodyHeight, false);
        }
    });
}