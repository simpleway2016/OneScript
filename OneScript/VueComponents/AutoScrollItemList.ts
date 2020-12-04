import { Component } from "../Component";
import Vue from "vue";
import Hammer from "../hammer.min.js"
import { ResizeListener } from "../ResizeListener";
import { AnimationHelper } from "../AnimationHelper";

var html = require("./autoScrollItemList.html");

export function registerAutoScrollItemList(tagname: string) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_AutoScrollItemList" } };

    var myhtml = Component.requireHtml(html, mycomponent);


    function myTouchStart(ev: Event) {
        ev.preventDefault();
    }

    Vue.component(tagname, {
        template: myhtml,
        data: function () {
            return {
                itemWidth: 0,
                listDatas:[]
            };
        },
        props: {
            itemcount: {
                type: Number,
                default: 3
            },
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
            }
        },
        methods: {
            onContainerResize: function () {
                if (this.$custsom.container.offsetWidth > 0) {
                    this.itemWidth = parseInt(<any>(this.$custsom.container.offsetWidth / this.itemcount));
                    if (this.$custsom.translateX == undefined && this.itemWidth > 0) {
                        this.$custsom.translateX = -this.itemWidth * this.datas.length * 2;

                        this.$custsom.itemContainer.style.transform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
                        this.$custsom.itemContainer.style.webkitTransform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
                    }

                    console.log("AutoScrollItemList执行onContainerResize,itemWidth:" + this.itemWidth + ",datas length:" + this.datas.length);
                }
            },
            onPan: function (x) {
                this.$custsom.translateX = this.$custsom.panStart_translateX + x;
                this.$custsom.itemContainer.style.transform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
                this.$custsom.itemContainer.style.webkitTransform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
            },
            onPanEnd: function () {
                var mod = this.$custsom.translateX % this.itemWidth;

                //计算目的值
                var target = this.$custsom.translateX - mod;
                var target2 = target + (mod / Math.abs(mod)) * this.itemWidth;
                
                if (Math.abs(target - this.$custsom.translateX) > Math.abs(target2 - this.$custsom.translateX)) {
                    target = target2;
                }

                this.$custsom.animationning = true;
                AnimationHelper.moveElement(this.$custsom.itemContainer, "0.25s linear", this.$custsom.translateX + "px", target + "px", "0", "0", 1, 1, true, ()=> {
                    this.$custsom.translateX = target;
                    this.$custsom.animationning = false;
                    if (this.$custsom.toResetDatas) {
                        this.resetDatas(this.$custsom.toResetDatas);
                        this.$custsom.toResetDatas = undefined;
                    }

                    this.calculatorX();
                });                
            },
            calculatorX: function () {
                //不管实际移动到了那里，最后都更改为，以中间一排为基准，移动到了什么位置
                var mod = this.$custsom.translateX % (this.itemWidth * this.datas.length);
                this.$custsom.translateX = -this.itemWidth * this.datas.length * 2 + mod;
                this.$custsom.itemContainer.style.transform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
                this.$custsom.itemContainer.style.webkitTransform = "translate3d(" + this.$custsom.translateX + "px,0,0)";

                if (this.autoplay)
                    this.$custsom.autoPlayTimeNumber = window.setTimeout(() => this.autoTranslateToNext(), this.interval);
            },
            resetDatas: function (newValue) {
                for (var i = 0; i < newValue.length; i++) {
                    var sitem = newValue[i];
                    if (this.listDatas.length > i) {
                        var titem = this.listDatas[i];
                        if (titem != sitem) {
                            this.listDatas.splice(i, 0, sitem);
                        }
                    }
                    else {
                        this.listDatas.push(sitem);
                    }
                }

                if (this.listDatas.length > newValue.length) {
                    this.listDatas.splice(newValue.length, this.listDatas.length - newValue.length);
                }
            },
            autoTranslateToNext: function () {
                if (this.$custsom.animationning || this.$custsom.isPanning || this.datas.length <= this.itemcount) {
                    if (this.autoplay)
                        this.$custsom.autoPlayTimeNumber = window.setTimeout(() => this.autoTranslateToNext(), this.interval);
                    return;
                }

                this.$custsom.animationning = true;
                AnimationHelper.moveElement(this.$custsom.itemContainer, "0.5s linear", this.$custsom.translateX + "px", (this.$custsom.translateX - this.itemWidth) + "px", "0", "0", 1, 1, true, ()=> {
                    this.$custsom.translateX = this.$custsom.translateX - this.itemWidth;
                    this.$custsom.animationning = false;
                    if (this.$custsom.toResetDatas) {
                        this.resetDatas(this.$custsom.toResetDatas);
                        this.$custsom.toResetDatas = undefined;
                    }

                    this.calculatorX();
                    
                }); 
            }
        },
        watch: {
            datas: function (newValue, oldValue) {
                console.log("AutoScrollItemList datas changed");

                if (this.$custsom.isPanning) {
                    this.$custsom.toResetDatas = newValue;
                }
                else {
                    this.resetDatas(newValue);
                }
            },
            autoplay: {
                handler(newVal) {
                    console.log("AutoScrollItemList autoplay changed,newValue:" + newVal);
                    if (newVal) {
                        this.$custsom.autoPlayTimeNumber = window.setTimeout(()=>this.autoTranslateToNext(), this.interval);
                    }
                    else {
                        window.clearTimeout(this.$custsom.autoPlayTimeNumber);
                    }
                },
                immediate: true,
            },
        },
        beforeCreate: function () {            
            (<any>this).$custsom = {
                autoPlayTimeNumber: 0
            };
        },
        beforeMount: function () {            

            this.listDatas = [];
            for (var i = 0; i < this.datas.length; i++) {
                this.listDatas.push(this.datas[i]);
            }
        },
        mounted: function () {
            console.log("AutoScrollItemList mounted");
           

            this.$custsom.container = this.$el;
            this.$custsom.itemContainer = this.$custsom.container.querySelector("#itemContainer");

            this.$custsom.resizeListener = new ResizeListener();
            this.$custsom.resizeListener.listenElement(this.$custsom.container);
            this.$custsom.resizeListener.onResize = (eles) => {
                this.onContainerResize();
            };

            this.$custsom.container.addEventListener("touchstart", myTouchStart);

            this.$custsom.hammer = new Hammer(this.$custsom.container, {
                preventDefault:true
            });
            this.$custsom.hammer.get('swipe').set({
                direction: Hammer.DIRECTION_HORIZONTAL
            });
            this.$custsom.hammer.on('pan panstart panend pancancel', (ev) => {
                if (this.$custsom.animationning || this.datas.length <= this.itemcount)
                    return;

                //console.log("hammer event:" + ev.type + ",ev.deltaX:" + ev.deltaX);
                switch (ev.type) {
                    case "pan":
                        if (this.$custsom.isPanning) {
                            this.onPan(ev.deltaX);
                        }
                        break;
                    case "panstart":
                        if (this.$custsom.autoPlayTimeNumber) {
                            window.clearTimeout(this.$custsom.autoPlayTimeNumber);
                            this.$custsom.autoPlayTimeNumber = 0;
                        }
                        this.$custsom.isPanning = true;
                        this.$custsom.panStart_translateX = this.$custsom.translateX;
                        break;
                    case "panend":
                    case "pancancel":
                        if (this.$custsom.isPanning) {
                            this.$custsom.isPanning = false;
                            this.onPanEnd();
                        }
                        break;
                }
            });

            this.onContainerResize();
        },
        destroyed: function () {
            console.log("AutoScrollItemList dispose");
            this.$custsom.container.removeEventListener("touchstart", myTouchStart);
            this.$custsom.resizeListener.dispose();
        }
    });
}