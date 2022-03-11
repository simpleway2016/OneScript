import { Component } from "../Component";
import Vue from "vue";
import { AnimationHelper } from "../AnimationHelper";
import { ResizeListener } from "../ResizeListener";

var html = require("./autoScrollPlay.html");



export function registerAutoScrollPlay(tagname: string) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_AutoScrollPlay" } };

    var myhtml = Component.requireHtml(html, mycomponent);


    Vue.component(tagname, {
        template: myhtml,
        data: function () {
            return {
                itemHeight:0
            };
        },
        props: {
            datas: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            autoplay: {
                type: Boolean,
                default: false
            },
            interval: {
                type: Number,
                default: 3000
            },            
        },
        methods: {
            run: function () {
                if (this._disposed)
                    return;

                this._timer = 0;
                if (this.itemHeight) {
                    var currentEle: HTMLElement = this._el_container.children[this._offsetIndex];
                    var nextEle: HTMLElement = this._el_container.children[this._offsetIndex + 1];
                    if (!nextEle) {
                        this._timer = window.setTimeout(this.run, this.interval);
                        return;
                    }
                    var tomoveY = nextEle.getBoundingClientRect().y - currentEle.getBoundingClientRect().y;
                    this._offset -= tomoveY;
                    this._offsetIndex++;
                    this._beginedAnimation = true;
                    AnimationHelper.moveElement(this._el_container, "0.7s linear", "0%", "0%", undefined, this._offset + "px", 1, 1, true, this.animationCallback);
                }
                else {
                    this._timer = window.setTimeout(this.run, this.interval);
                }
            },
            animationCallback: function () {
                if (this._disposed)
                    return;

                if (this._timer) {
                    window.clearTimeout(this._timer);
                    this._timer = 0;
                }

                this._beginedAnimation = false;
                if (this._offsetIndex >= this.datas.length) {
                    //console.log("重回到第一个");
                    this._offset = 0;
                    this._offsetIndex = 0;
                    this._el_container.style.transform = "";
                }

                if (this.autoplay) {
                    this._timer = window.setTimeout(this.run, this.interval);
                }
            },
            onResize: function () {
                this.itemHeight = (<HTMLElement>this._el_container.parentElement).getBoundingClientRect().height;
                //console.log("size变化:" + this.itemHeight);
            }
        },
        watch: {
            datas: function (newValue, oldValue) {
                if (this._timer) {
                    window.clearTimeout(this._timer);
                    this._timer = 0;
                }

                this._offset = 0;
                this._offsetIndex = 0;
                if (!this._beginedAnimation) {
                    this._el_container.style.transform = "";
                    this._timer = window.setTimeout(this.run, this.interval);
                }                
            },
            autoplay: function (newValue, oldValue) {
                //console.log("autoplay:" + newValue);
                if (this._timer) {
                    window.clearTimeout(this._timer);
                    this._timer = 0;
                }

                if (newValue) {                    
                    this._timer = window.setTimeout(this.run, this.interval);
                }
            },
        },
        beforeCreate: function () {            
           
        },
        updated: function () {
           
        },
        beforeMount: function () {            

        },
        mounted: function () {
            this._offset = 0;
            this._offsetIndex = 0;
            this._el_container = this.$el.querySelector("#root");
           

            var resizeListener = new ResizeListener();
            resizeListener.onResize = this.onResize;
            resizeListener.listenElement(this._el_container.parentElement);
            this._resizeListener = resizeListener;

            this.itemHeight = (<HTMLElement>this._el_container.parentElement).getBoundingClientRect().height;
            this._timer = window.setTimeout(this.run, this.interval);
        },
        destroyed: function () {
            this._disposed = true;
            this._resizeListener.dispose();
            //console.log("autoplay disposed");
        }
    });
}