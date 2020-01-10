"use strict";
exports.__esModule = true;
var jack_one_script_1 = require("jack-one-script");
var vue_1 = require("vue");
var html = require("./selector.html");
function registerSelector(tagname) {
    var styleEle = document.createElement("STYLE");
    styleEle.innerHTML = "\n.jack-one-script-selector-title\n{\ntext-align:center;\nfont-weight:bold;\n    color:#8F8E94;\nfont-size:13px;\nheight:36px;\nline-height:36px;\n    \n}\n.jack-one-script-selector-option\n{\ntext-align:center;\nfont-weight:bold;\n    color:#BCA66A;\nfont-size:16px;\nheight:40px;\nline-height:40px;\n    \n}\n";
    document.head.appendChild(styleEle);
    vue_1["default"].component(tagname, {
        template: jack_one_script_1.Component.requireHtml(html, { constructor: { name: "OneScript_Components_Selector" } }),
        model: {
            prop: 'value',
            event: 'change'
        },
        data: function () {
            return {
                curValue: "",
                bodyHeight: 0,
                maskBottom: "-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,1)),to(rgba(0,0,0,0)),color-stop(0.8,rgba(0,0,0,1)))",
                maskTopBottom: "-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0)),to(rgba(0,0,0,0)),color-stop(0.2,rgba(0,0,0,1)),color-stop(0.8,rgba(0,0,0,1)))",
                maskTop: "-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0)),to(rgba(0,0,0,1)),color-stop(0.2,rgba(0,0,0,1)))",
                maskFinally: ""
            };
        },
        props: {
            /**要使用v-model绑定变量，不要直接用value，因为v-model才是双向绑定*/
            value: {
                type: String,
                "default": ""
            },
            options: {
                type: Array,
                "default": function () {
                    return [];
                }
            },
            canceltext: {
                type: String,
                "default": "Cancel"
            },
            bgcolor: {
                type: String,
                "default": "#fff"
            },
            optionclass: {
                type: String,
                "default": "jack-one-script-selector-option"
            },
            selectedtextcolor: {
                type: String,
                "default": "#A8202B"
            },
            title: {
                type: String,
                "default": "选单操作说明文字"
            },
            titleclass: {
                type: String,
                "default": "jack-one-script-selector-title"
            },
            borderRadius: {
                type: String,
                "default": "10px"
            },
            margin: {
                type: String,
                "default": "10px"
            }
        },
        methods: {
            optionClick: function (option) {
                this.curValue = option.value.toString();
                this.$emit('change', this.curValue);
                this.cancelClick();
            },
            getBodyHeight: function () {
                if (this.bodyHeight === 0) {
                    this.bodyHeight = window.innerHeight * 0.65 + "px";
                }
                else {
                    //测算
                    try {
                        var otherHeight = this.layerEle.querySelector("#btnCancel").getBoundingClientRect().height + this.layerEle.querySelector("#divTitle").getBoundingClientRect().height;
                        this.bodyHeight = (window.innerHeight - otherHeight) * 0.7 + "px";
                    }
                    catch (e) {
                        this.bodyHeight = window.innerHeight * 0.65 + "px";
                    }
                }
            },
            checkOnScroll: function () {
                var maskFinally = "";
                if (this.options.length > 0) {
                    var divContainer = this.optionContainer;
                    var rect = divContainer.getBoundingClientRect();
                    var name = "";
                    if (divContainer.scrollTop > 0) {
                        name += "Top";
                    }
                    if (divContainer.scrollHeight > divContainer.scrollTop + divContainer.offsetHeight) {
                        name += "Bottom";
                    }
                    var self = this;
                    eval("maskFinally=self.mask" + name);
                }
                this.maskFinally = maskFinally;
            },
            cancelClick: function () {
                this.layerEle.style.visibility = "hidden";
            },
            open: function () {
                var selectedEle = this.layerEle.querySelector("div[_selected='1']");
                if (selectedEle) {
                    var divContainer = this.optionContainer;
                    var cRect = divContainer.getBoundingClientRect();
                    selectedEle.scrollIntoView();
                    var rect = selectedEle.getBoundingClientRect();
                    if (Math.abs(rect.top - cRect.top) < rect.height * 0.2)
                        divContainer.scrollTop -= (cRect.height - rect.height) / 2;
                    console.log("Selector finded selectedEle");
                }
                this.layerEle.style.visibility = "visible";
            }
        },
        watch: {
            value: function (newValue) {
                this.curValue = newValue;
            }
        },
        beforeMount: function () {
            this.getBodyHeight();
        },
        mounted: function () {
            var layerEle = this.$el.querySelector("#layer");
            layerEle.parentElement.removeChild(layerEle);
            document.body.appendChild(layerEle);
            this.layerEle = layerEle;
            this.optionContainer = this.layerEle.querySelector("#divContainer");
            this.optionContainer.addEventListener("scroll", this.checkOnScroll, false);
            window.addEventListener("resize", this.getBodyHeight, false);
            this.checkOnScroll();
        },
        destroyed: function () {
            window.removeEventListener("resize", this.getBodyHeight, false);
            this.optionContainer.removeEventListener("scroll", this.checkOnScroll, false);
            if (this.layerEle) {
                document.body.removeChild(this.layerEle);
                delete this.layerEle;
                console.log("Selector destroyed");
            }
        }
    });
}
exports.registerSelector = registerSelector;
