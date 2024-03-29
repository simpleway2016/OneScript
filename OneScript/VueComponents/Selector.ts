﻿import { Component } from "../Component";
import Vue from "vue";

var html = require("./selector.html");


export interface SelectorOption {
    /**取消文本 */
    canceltext?: string;
    /**选中的项的样式 */
    selectedclass?: string;
    /**主框样式 */
    boxclass?: string;
    cancelclass?: string;
    /**遮盖层颜色，默认rgba(0,0,0,0.4) */
    maskcolor?: string;
    /**标题 */
    title?: string;
    /**标题文字的样式 */
    titleclass?: string;
    /**选项的样式 */
    optionclass?: string;
    /**初始化后，是否直接弹出显示框 */
    showOptionOnInit?: boolean;
    /**取消时的回调 */
    oncancel?: () => void;
}

export function registerSelector(tagname: string, option: SelectorOption) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_Selector" } };

    var myhtml = Component.requireHtml(html, mycomponent);
    var rootClassName = (<any>mycomponent).constructor._onescriptClassName;

    var myOption: SelectorOption = {
        canceltext: "Cancel",
        maskcolor: "rgba(0,0,0,0.4)",
        optionclass: "",
        selectedclass: "jack-one-script-selector-selected",
        titleclass: "",
        boxclass: "",
        cancelclass:"",
        showOptionOnInit: false,
        oncancel: undefined,
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
        model: {
            prop: 'value',
            event: 'change'
        },
        data: function () {
            return {
                hasSelectionSlot:false,
                curValue: undefined,
                bodyHeight: 0,
                maskBottom: "-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,1)),to(rgba(0,0,0,0)),color-stop(0.7,rgba(0,0,0,1)))",
                maskTopBottom: "-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0)),to(rgba(0,0,0,0)),color-stop(0.3,rgba(0,0,0,1)),color-stop(0.7,rgba(0,0,0,1)))",
                maskTop: "-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,0)),to(rgba(0,0,0,1)),color-stop(0.3,rgba(0,0,0,1)))",
                maskFinally:"",
            };
        },
        props: {
            /**要使用v-model绑定变量，不要直接用value，因为v-model才是双向绑定*/
            value: {
                default: ""
            },
            options: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            canceltext: {
                type: String,
                default: myOption.canceltext
            },
            maskcolor: {
                type: String,
                default: myOption.maskcolor,
            },
            optionclass: {
                type: String,
                default: myOption.optionclass,
            },
            cancelclass: {
                type: String,
                default: myOption.cancelclass,
            },
            boxclass: {
                type: String,
                default: myOption.boxclass,
            },
            selectedclass: {
                type: String,
                default: myOption.selectedclass
            },
            title: {
                type: String,
                default: ""
            },
            titleclass: {
                type: String,
                default: myOption.titleclass
            },
            showOptionOnInit: {
                type: Boolean,
                default: myOption.showOptionOnInit
            },
            oncancel: {
                type: Function,
                default: myOption.oncancel,
            },
            textmember: {
                type: String,
                default: "text",
            },
            valuemember: {
                type: String,
                default: "value",
            },
        },
       methods: {
           getText: function (option, replace) {
               var ret;
               if (typeof option == "string") {
                   ret = option;
               }
               else {
                   if (!this.textmember)
                       ret = option;
                   else
                       ret = option[this.textmember];
               }

               if (replace && typeof ret == "string") {
                   ret = ret.replace(/\n/g, '<br>');
               }
               
               return ret;
           },
           getValue: function (option) {
               if (typeof option == "string") {
                   return option;
               }

               if (!this.valuemember)
                   return option;
               return option[this.valuemember];
           },
           optionClick: function (option) {
               this.$emit('clickoption', option);

                this.curValue = this.getValue(option);
                this.$emit('change', this.curValue);
                this.layerEle.style.visibility = "hidden";
                this.$emit('hide', true);
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
                    } catch (e) {
                        this.bodyHeight = window.innerHeight * 0.65 + "px";
                    }
                   
                }

                
            },
            checkOnScroll: function () {
                var maskFinally = "";
                if (this.options && this.options.length > 0) {
                    var divContainer: HTMLElement = this.optionContainer;
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
                if (this.oncancel)
                    this.oncancel();
            },
            open: function () {
                var selectedEle: HTMLElement = (<HTMLElement>this.layerEle).querySelector("div[_selected='1']");
                if (selectedEle) {
                    var divContainer: HTMLElement = this.optionContainer;
                    var cRect = divContainer.getBoundingClientRect();

                    selectedEle.scrollIntoView();
                    var rect = selectedEle.getBoundingClientRect();
                    if (Math.abs(rect.top - cRect.top) < rect.height*0.2)
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

           this.hasSelectionSlot = this.$scopedSlots.selection != undefined;
           //for (var p in this) {
           //    console.log(p);
           //    console.log(this[p]);
           //}
          
           var self = this;
           (<HTMLElement>this.$el).addEventListener("click", function () {
               self.open();
           });
            var layerEle: HTMLElement = this.$el.querySelector("#layer");
            layerEle.parentElement.removeChild(layerEle);
            //给layerEle设置根部样式，这样，html <header> 里面的style才能作用到layerEle上
            layerEle.className = rootClassName + " " + layerEle.className;
            document.body.appendChild(layerEle);

            this.layerEle = layerEle;
            this.optionContainer = this.layerEle.querySelector("#divContainer");

            this.optionContainer.addEventListener("scroll", this.checkOnScroll, false);
            window.addEventListener("resize", this.getBodyHeight, false);
            this.checkOnScroll();

            this.curValue = this.value;

            if (this.showOptionOnInit) {
                this.open();
            }
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