import { Component } from "../Component";
import Vue from "vue";

var html = require("./alertWindow.html");
export function registerAlertWindow(tagname: string) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_AlertWindow" } };

    var myhtml = Component.requireHtml(html, mycomponent);
    var rootClassName = (<any>mycomponent).constructor._onescriptClassName;

    Vue.component(tagname, {
        template: myhtml,
        data: function () {
            return {
                
            };
        },
        model: {
            prop: 'visible',
            event: 'change'
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: "title"
            },
            borderRadius: {
                type: String,
                default: "10px"
            },
            bgcolor: {
                type: String,
                default: "#fff"
            },
            titleclass: {
                type: String,
                default: "jack-one-script-alertwindow-title"
            },
            contentclass: {
                type: String,
                default: "jack-one-script-alertwindow-content"
            },
            buttons: {
                type: Array,
                default: [{
                    text: "OK",
                    textClass: "",
                    bold:true
                }]
            },
        },
        methods: {
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
            
        },
        mounted: function () {
            var layerEle: HTMLElement = this.$el.querySelector("#layer");
            layerEle.parentElement.removeChild(layerEle);
            //给layerEle设置根部样式，这样，html <header> 里面的style才能作用到layerEle上
            layerEle.className = rootClassName + " " + layerEle.className;
            document.body.appendChild(layerEle);
        },
        destroyed: function () {
            
        }
    });
}