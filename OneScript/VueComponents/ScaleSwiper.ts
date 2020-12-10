﻿import { Component } from "../Component";
import Vue from "vue";
import Hammer from "../hammer.min.js"
import { ResizeListener } from "../ResizeListener";
import { AnimationHelper } from "../AnimationHelper";

var html = require("./scaleSwiper.html");

export interface ScaleSwiperOption {
    /**分页器容器的样式 */
    paginationContainerClass?: string;
    /**分页器个体的样式 */
    paginationItemClass?: string;
    /**分页器聚焦个体的样式 */
    paginationActiveItemClass?: string;
}

export function registerScaleSwiper(option: ScaleSwiperOption, tagname: string) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_ScaleSwiper" } };

    var myhtml = Component.requireHtml(html, mycomponent);

    var myOption: ScaleSwiperOption = {
        paginationContainerClass: "",
        paginationItemClass: "",
        paginationActiveItemClass:""
    };
    if (option) {
        for (var p in option) {
            var val = option[p];
            if (typeof val !== "undefined") {
                myOption[p] = val;
            }
        }
    }

    function myTouchStart(ev: Event) {
        ev.preventDefault();
    }

    function fireClickEvent(element) {
        if (document.createEvent) {
            var theEvent = document.createEvent('MouseEvents');
            theEvent.initEvent('click', true, true);

            element.dispatchEvent(theEvent);
        } else if (element.fireEvent) {
            element.fireEvent('onclick');
        }
    }

    Vue.component(tagname, {
        template: myhtml,
        data: function () {
            return {
                currentIndex:0,
                trueItemWidth: 0,
                trueItemHeight:0,
                listDatas:[]
            };
        },
        props: {
            datas: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            itemwidth: {
                type: Number,
                default:0,
            },
            itemheight: {
                type: Number,
                default: 0,
            },
            scale: {
                type: Number,
                default:0.8
            },
            autoplay: {
                type: Boolean,
                default: false
            },
            interval: {
                type: Number,
                default: 3000
            },
            showPagination: {
                type: Boolean,
                default: true
            },
            paginationContainerClass: {
                type: String,
                default: myOption.paginationContainerClass
            },
            paginationItemClass: {
                type: String,
                default: myOption.paginationItemClass
            },
            paginationActiveItemClass: {
                type: String,
                default: myOption.paginationActiveItemClass
            },
        },
        methods: {
            onContainerResize: function () {
                if (this.$custsom.container.offsetWidth > 0) {
                    if (this.itemheight == 0 || this.itemwidth == 0) {
                        this.$custsom.container.style.height = "100%";
                        this.$custsom.margin = 0;
                    }
                    else {
                        var w = parseInt(<any>(this.$custsom.container.offsetWidth / (1 + (1 - this.scale) * 0.75 * 2)));
                        var flag = this.itemwidth / this.itemheight;
                       
                        this.trueItemWidth = w;
                        this.trueItemHeight = parseInt(<any>(w / flag));

                        this.$custsom.container.style.height = parseInt(<any>(this.trueItemHeight * this.maxScale)) + "px";

                        this.$custsom.margin = parseInt(<any>(this.trueItemWidth * (1 - this.scale)*0.75));                       
                    }

                    this.$custsom.itemContainer.style.paddingLeft = this.$custsom.margin + "px";

                    if (this.$custsom.translateX == undefined) {
                        this.$custsom.translateX = -this.trueItemWidth * this.datas.length;

                        this.calculatorX();
                    }
                }
            },
            onPan: function (x) {
                this.$custsom.translateX = this.$custsom.panStart_translateX + x;

                var index;
                if (this.$custsom.translateX < 0) {
                    index = Math.floor(-this.$custsom.translateX / this.trueItemWidth);
                }
                else {
                    index = -Math.floor(this.$custsom.translateX / this.trueItemWidth);
                }

                if (x > 0)
                    index++;
               
                this.$custsom.centerItem = this.$custsom.itemContainer.children[index];
                this.$custsom.preItem = this.$custsom.itemContainer.children[index - 1];
                this.$custsom.nextItem = this.$custsom.itemContainer.children[index + 1];

                var movingflag = Math.abs((x % this.trueItemWidth) / this.trueItemWidth);
                var scale;
                var distance = this.maxScale - this.scale;

                if (movingflag == 0 && x > 0) {
                    movingflag = 1;
                }

                scale = distance * (1 - movingflag) + this.scale;

                this.$custsom.centerItem.style.transform = `scale(${scale},${scale})`;
                this.$custsom.centerItem._$scale = scale;

                var nextflag = this.scale + distance * movingflag;
                //console.log({
                //    index,
                //    translateX:this.$custsom.translateX,
                //    nextflag,
                //    scale,
                //    movingflag
                //});
                if (x < 0) {
                    this.$custsom.nextItem.style.transform = `scale(${nextflag},${nextflag})`;
                    this.$custsom.nextItem._$scale = nextflag;

                    this.$custsom.preItem.style.transform = `scale(${this.scale},${this.scale})`;
                    this.$custsom.preItem._$scale = this.scale;

                }
                else {
                    this.$custsom.preItem.style.transform = `scale(${nextflag},${nextflag})`;
                    this.$custsom.preItem._$scale = nextflag;

                    this.$custsom.nextItem.style.transform = `scale(${this.scale},${this.scale})`;
                    this.$custsom.nextItem._$scale = this.scale;
                }

                this.$custsom.itemContainer.style.transform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
            },
            onPanEnd: function (x) {
                var index;
                if (this.$custsom.translateX < 0) {
                    index = Math.floor(-this.$custsom.translateX / this.trueItemWidth);
                }
                else {
                    index = -Math.floor(this.$custsom.translateX / this.trueItemWidth);
                }

                if (x > 0)
                    index++;

                this.$custsom.centerItem = this.$custsom.itemContainer.children[index];
                this.$custsom.preItem = this.$custsom.itemContainer.children[index - 1];
                this.$custsom.nextItem = this.$custsom.itemContainer.children[index + 1];

                var target;
                this.$custsom.animationning = true;
                var timeAndMode = "0.5s linear";

                if (x < 0) {
                    target = this.$custsom.translateX / this.trueItemWidth;
                    target = Math.floor(Math.abs(target)) + 1;
                    target = -target * this.trueItemWidth;

                    AnimationHelper.moveElements([
                        {
                            ele: this.$custsom.itemContainer,
                            timeAndMode: timeAndMode,
                            fromX: this.$custsom.translateX + "px",
                            toX: target + "px",
                            fromY: "0",
                            toY: "0",
                            fromScale: 1,
                            toScale: 1,
                            keepValue:true
                        },
                        {
                            ele: this.$custsom.centerItem,
                            timeAndMode: timeAndMode,
                            fromX: "0",
                            toX: "0",
                            fromY: "0",
                            toY: "0",
                            fromScale: this.$custsom.centerItem._$scale,
                            toScale: this.scale,
                            keepValue: true
                        },
                        {
                            ele: this.$custsom.nextItem,
                            timeAndMode: timeAndMode,
                            fromX: "0",
                            toX: "0",
                            fromY: "0",
                            toY: "0",
                            fromScale: this.$custsom.nextItem._$scale,
                            toScale: this.maxScale,
                            keepValue: true
                        },
                        {
                            ele: this.$custsom.preItem,
                            timeAndMode: timeAndMode,
                            fromX: "0",
                            toX: "0",
                            fromY: "0",
                            toY: "0",
                            fromScale: this.$custsom.preItem._$scale,
                            toScale: this.scale,
                            keepValue: true
                        }
                    ], () => {
                        this.$custsom.translateX = target;
                        this.$custsom.animationning = false;
                        if (this.$custsom.toResetDatas) {
                            this.resetDatas(this.$custsom.toResetDatas);
                            this.$custsom.toResetDatas = undefined;
                        }

                        this.calculatorX();

                    });
                }
                else {
                    target = this.$custsom.translateX / this.trueItemWidth;
                    target = Math.floor(Math.abs(target));
                    target = -target * this.trueItemWidth;

                    AnimationHelper.moveElements([
                        {
                            ele: this.$custsom.itemContainer,
                            timeAndMode: timeAndMode,
                            fromX: this.$custsom.translateX + "px",
                            toX: target + "px",
                            fromY: "0",
                            toY: "0",
                            fromScale: 1,
                            toScale: 1,
                            keepValue: true
                        },
                        {
                            ele: this.$custsom.centerItem,
                            timeAndMode: timeAndMode,
                            fromX: "0",
                            toX: "0",
                            fromY: "0",
                            toY: "0",
                            fromScale: this.$custsom.centerItem._$scale,
                            toScale: this.scale,
                            keepValue: true
                        },
                        {
                            ele: this.$custsom.preItem,
                            timeAndMode: timeAndMode,
                            fromX: "0",
                            toX: "0",
                            fromY: "0",
                            toY: "0",
                            fromScale: this.$custsom.preItem._$scale,
                            toScale: this.maxScale,
                            keepValue: true
                        },
                        {
                            ele: this.$custsom.nextItem,
                            timeAndMode: timeAndMode,
                            fromX: "0",
                            toX: "0",
                            fromY: "0",
                            toY: "0",
                            fromScale: this.$custsom.nextItem._$scale,
                            toScale: this.scale,
                            keepValue: true
                        }
                    ], () => {
                        this.$custsom.translateX = target;
                        this.$custsom.animationning = false;
                        if (this.$custsom.toResetDatas) {
                            this.resetDatas(this.$custsom.toResetDatas);
                            this.$custsom.toResetDatas = undefined;
                        }

                        this.calculatorX();

                    });
                }

            },
            calculatorX: function () {
                if (this.$custsom.autoPlayTimeNumber) {
                    window.clearTimeout(this.$custsom.autoPlayTimeNumber);
                    this.$custsom.autoPlayTimeNumber = 0;
                }

                //不管实际移动到了那里，最后都更改为，以中间一排为基准，移动到了什么位置
                var mod = this.$custsom.translateX % (this.trueItemWidth * this.datas.length);
                var index = Math.floor(<any>(Math.abs(mod) / this.trueItemWidth));
                this.currentIndex = index;

                this.$custsom.translateX = -this.trueItemWidth * this.datas.length + mod;
                this.$custsom.itemContainer.style.transform = "translate3d(" + this.$custsom.translateX + "px,0,0)";
                this.$custsom.itemContainer.style.webkitTransform = "translate3d(" + this.$custsom.translateX + "px,0,0)";

                this.$custsom.centerItem = this.$custsom.itemContainer.children[this.datas.length + index];
                this.$custsom.preItem = this.$custsom.itemContainer.children[this.datas.length + index - 1];
                this.$custsom.nextItem = this.$custsom.itemContainer.children[this.datas.length + index + 1];
                for (var i = 0; i < this.$custsom.itemContainer.children.length; i++) {
                    var item = this.$custsom.itemContainer.children[i];
                    if (item === this.$custsom.centerItem) {
                        item._$scale = this.maxScale;
                        
                        
                    }
                    else {
                        item._$scale = this.scale;
                    }
                    item.style.transform = `scale(${item._$scale},${item._$scale})`;
                }

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
                if (this.$custsom.animationning || this.$custsom.isPanning) {
                    return;
                }

                this.onPanEnd(-1);
            }
        },
        watch: {
            datas: function (newValue, oldValue) {
                console.log("ScaleSwiper datas changed");

                if (this.$custsom.isPanning) {
                    this.$custsom.toResetDatas = newValue;
                }
                else {
                    this.resetDatas(newValue);
                }
            },
            autoplay: {
                handler(newVal) {
                    console.log("ScaleSwiper autoplay changed,newValue:" + newVal);
                    if (newVal) {
                        this.$custsom.autoPlayTimeNumber = window.setTimeout(()=>this.autoTranslateToNext(), this.interval);
                    }
                    else {
                        window.clearTimeout(this.$custsom.autoPlayTimeNumber);
                    }
                },
                immediate: true,
            },
            scale: {
                handler(newValue) {
                    this.maxScale = 1 + (1 - newValue) / 2;
                },
                immediate: true,
            }
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
            console.log("ScaleSwiper mounted");
           
            this.$custsom.container = this.$el.children[0];
            this.$custsom.itemContainer = this.$custsom.container.querySelector("#itemContainer");

            this.$custsom.resizeListener = new ResizeListener();
            this.$custsom.resizeListener.listenElement(this.$custsom.container);
            this.$custsom.resizeListener.onResize = (eles) => {
                this.onContainerResize();
            };

            this.onContainerResize();

            this.$custsom.container.addEventListener("touchstart", myTouchStart);

            this.$custsom.hammer = new Hammer(this.$custsom.container, {
                preventDefault:true
            });
            this.$custsom.hammer.get('swipe').set({
                direction: Hammer.DIRECTION_HORIZONTAL
            });

            this.$custsom.hammer.on('pan panstart panend pancancel tap', (ev) => {
                if (this.$custsom.animationning)
                    return;

                if (this.$custsom.autoPlayTimeNumber) {
                    window.clearTimeout(this.$custsom.autoPlayTimeNumber);
                    this.$custsom.autoPlayTimeNumber = 0;
                }

                var event: Event = ev.srcEvent;
                //console.log("hammer event:" + ev.type + ",ev.deltaX:" + ev.deltaX);
                switch (ev.type) {
                    case "pan":
                        if (this.$custsom.isPanning) {
                            this.onPan(ev.deltaX);
                        }
                        break;
                    case "panstart":                        
                        this.$custsom.isPanning = true;
                        this.$custsom.panStart_translateX = this.$custsom.translateX;
                        break;
                    case "panend":
                    case "pancancel":
                        if (this.$custsom.isPanning) {
                            this.$custsom.isPanning = false;
                            this.onPanEnd(ev.deltaX);
                        }
                        break;
                    case "tap":
                        fireClickEvent(event.srcElement);
                        break;
                }
            });
        },
        destroyed: function () {
            console.log("ScaleSwiper dispose");
            this.$custsom.container.removeEventListener("touchstart", myTouchStart);
            this.$custsom.resizeListener.dispose();
        }
    });
}