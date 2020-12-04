import { Component } from "../Component";
import Vue from "vue";
import Hammer from "../hammer.min.js"
import { ResizeListener } from "../ResizeListener";
import { AnimationHelper } from "../AnimationHelper";

var html = require("./autoScrollItemList.html");

export function registerAutoScrollItemList(tagname: string) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_AutoScrollItemList" } };

    var myhtml = Component.requireHtml(html, mycomponent);

    var resizeListener: ResizeListener;
    var container: HTMLElement;
    var itemContainer: HTMLElement;
    var hammer: Hammer;
    var translateX = undefined;
    var panStart_translateX;
    var isPanning = false;
    var animationning = false;
    var toResetDatas = undefined;
    var self;
    var autoPlayTimeNumber = 0;

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
                if (container.offsetWidth > 0) {
                    this.itemWidth = parseInt(<any>(container.offsetWidth / this.itemcount));
                    if (translateX == undefined && this.itemWidth > 0) {
                        translateX = -this.itemWidth * this.datas.length * 2;

                        itemContainer.style.transform = "translate3d(" + translateX + "px,0,0)";
                        itemContainer.style.webkitTransform = "translate3d(" + translateX + "px,0,0)";
                    }

                    console.log("AutoScrollItemList执行onContainerResize,itemWidth:" + this.itemWidth + ",datas length:" + this.datas.length);
                }
            },
            onPan: function (x) {
                translateX = panStart_translateX + x;
                itemContainer.style.transform = "translate3d(" + translateX + "px,0,0)";
                itemContainer.style.webkitTransform = "translate3d(" + translateX + "px,0,0)";
            },
            onPanEnd: function () {
                var mod = translateX % this.itemWidth;

                //计算目的值
                var target = translateX - mod;
                var target2 = target + (mod / Math.abs(mod)) * this.itemWidth;
                
                if (Math.abs(target - translateX) > Math.abs(target2 - translateX)) {
                    target = target2;
                }

                animationning = true;
                AnimationHelper.moveElement(itemContainer, "0.25s linear", translateX + "px", target + "px", "0", "0", 1, 1, true, function () {
                    translateX = target;
                    animationning = false;
                    if (toResetDatas) {
                        self.resetDatas(toResetDatas);
                        toResetDatas = undefined;
                    }

                    self.calculatorX();
                });                
            },
            calculatorX: function () {
                //不管实际移动到了那里，最后都更改为，以中间一排为基准，移动到了什么位置
                var mod = translateX % (self.itemWidth * self.datas.length);
                translateX = -self.itemWidth * self.datas.length * 2 + mod;
                itemContainer.style.transform = "translate3d(" + translateX + "px,0,0)";
                itemContainer.style.webkitTransform = "translate3d(" + translateX + "px,0,0)";

                if (self.autoplay)
                    autoPlayTimeNumber = window.setTimeout(self.autoTranslateToNext, self.interval);
            },
            resetDatas: function (newValue) {
                for (var i = 0; i < newValue.length; i++) {
                    var sitem = newValue[i];
                    if (self.listDatas.length > i) {
                        var titem = self.listDatas[i];
                        if (titem != sitem) {
                            self.listDatas.splice(i, 0, sitem);
                        }
                    }
                    else {
                        self.listDatas.push(sitem);
                    }
                }

                if (self.listDatas.length > newValue.length) {
                    self.listDatas.splice(newValue.length, self.listDatas.length - newValue.length);
                }
            },
            autoTranslateToNext: function () {
                if (animationning || isPanning || self.datas.length <= self.itemcount) {
                    if (self.autoplay)
                        autoPlayTimeNumber = window.setTimeout(self.autoTranslateToNext, self.interval);
                    return;
                }

                animationning = true;
                AnimationHelper.moveElement(itemContainer, "0.5s linear", translateX + "px", (translateX - self.itemWidth) + "px", "0", "0", 1, 1, true, function () {
                    translateX = translateX - self.itemWidth;
                    animationning = false;
                    if (toResetDatas) {
                        self.resetDatas(toResetDatas);
                        toResetDatas = undefined;
                    }

                    self.calculatorX();
                    
                }); 
            }
        },
        watch: {
            datas: function (newValue, oldValue) {
                console.log("AutoScrollItemList datas changed");

                if (isPanning) {
                    toResetDatas = newValue;
                }
                else {
                    this.resetDatas(newValue);
                }
            },
            autoplay: {
                handler(newVal) {
                    //console.log("autoplay changed,newValue:" + newVal);
                    if (newVal) {
                        autoPlayTimeNumber = window.setTimeout(this.autoTranslateToNext, this.interval);
                    }
                    else {
                        window.clearTimeout(autoPlayTimeNumber);
                    }
                },
                immediate: true,
            },
        },
        beforeMount: function () {
            this.listDatas = [];
            for (var i = 0; i < this.datas.length; i++) {
                this.listDatas.push(this.datas[i]);
            }
        },
        mounted: function () {
            console.log("AutoScrollItemList mounted");

            self = this;
            container = this.$el;
            itemContainer = container.querySelector("#itemContainer");

            resizeListener = new ResizeListener();
            resizeListener.listenElement(container);
            resizeListener.onResize = (eles) => {
                self.onContainerResize();
            };

            container.addEventListener("touchstart", myTouchStart);

            hammer = new Hammer(container, {
                preventDefault:true
            });
            hammer.get('swipe').set({
                direction: Hammer.DIRECTION_HORIZONTAL
            });
            hammer.on('pan panstart panend pancancel', (ev) => {
                if (animationning || self.datas.length <= self.itemcount)
                    return;

                console.log("hammer event:" + ev.type + ",ev.deltaX:" + ev.deltaX);
                switch (ev.type) {
                    case "pan":
                        if (isPanning) {
                            self.onPan(ev.deltaX);
                        }
                        break;
                    case "panstart":
                        if (autoPlayTimeNumber) {
                            window.clearTimeout(autoPlayTimeNumber);
                            autoPlayTimeNumber = 0;
                        }
                        isPanning = true;
                        panStart_translateX = translateX;
                        break;
                    case "panend":
                    case "pancancel":
                        if (isPanning) {
                            isPanning = false;
                            self.onPanEnd();
                        }
                        break;
                }
            });

            this.onContainerResize();
        },
        destroyed: function () {
            console.log("AutoScrollItemList dispose");
            container.removeEventListener("touchstart", myTouchStart);
            resizeListener.dispose();
        }
    });
}