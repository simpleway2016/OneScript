import { Component } from "../Component";
import Vue from "vue";
import Hammer from "../hammer.min.js"
import { ResizeListener } from "../ResizeListener";
import { AnimationHelper } from "../AnimationHelper";
import { unwatchFile } from "fs";

var html = require("./viewPager.html");

export interface ViewPagerOption {
    /**分页器容器的样式 */
    paginationContainerClass?: string;
    /**分页器个体的样式 */
    paginationItemClass?: string;
    /**分页器聚焦个体的样式 */
    paginationActiveItemClass?: string;
}

export function registerViewPager(option: ViewPagerOption, tagname: string) {

    var mycomponent: Component = <any>{ constructor: { name: "OneScript_Components_ViewPager" } };

    var myhtml = Component.requireHtml(html, mycomponent);

    var myOption: ViewPagerOption = {
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
                lastChildrenLength:0,
                currentIndex: 0,
                itemWidth:0,
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
            autoplay: {
                type: Boolean,
                default: false
            },
            loop: {
                type: Boolean,
                default: true
            },
            canMoveBack: {
                type: Boolean,
                default: true
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
                this.itemWidth = this.$custsom.container.offsetWidth;
                if (this.$custsom.container.offsetWidth > 0) {
                    this.calculatorX();
                }
            },
            onPan: function (x) {

                if (x < 0) {
                    if ( !this.loop && this.currentIndex == this.listDatas.length - 1)
                        x = 0;

                    if (x <= - this.$custsom.container.offsetWidth)
                        x = - this.$custsom.container.offsetWidth + 1;
                }
                else {
                    if (!this.loop && this.currentIndex == 0)
                        x = 0;
                    else if (!this.canMoveBack)
                        x = 0;

                    if (x >= this.$custsom.container.offsetWidth)
                        x = this.$custsom.container.offsetWidth - 1;
                }
                this.$custsom.translateX = this.$custsom.panStart_translateX + x;                
                this.$custsom.itemContainer.style.transform = `translate3d(${this.$custsom.translateX}px,0,0)`;

            },
            onPanEnd: function (x) {         
                var endaction = () => {
                    if (this.$custsom.toResetDatas) {
                        this.resetDatas(this.$custsom.toResetDatas);
                        this.$custsom.toResetDatas = undefined;
                    }

                    this.calculatorX();

                    return;
                };

                if (x < 0) {
                    if (!this.loop && this.currentIndex == this.listDatas.length - 1) {
                        endaction();
                        return;
                    }
                }
                else if (x > 0) {
                    if (!this.loop && this.currentIndex == 0) {
                        endaction();
                        return;
                    }
                    else if (!this.canMoveBack)
                    {
                        endaction();
                        return;
                    }
                }
                else {
                    endaction();
                    return;
                }


                var target;
                this.$custsom.animationning = true;
                var timeAndMode = "0.5s linear";

                if (x < 0) {
                    target = this.$custsom.translateX / this.$custsom.container.offsetWidth;
                    target = Math.floor(Math.abs(target)) + 1;
                    target = -target * this.$custsom.container.offsetWidth;
                    
                    AnimationHelper.moveElements([
                        {
                            ele: this.$custsom.itemContainer,
                            timeAndMode: timeAndMode,
                            fromX: undefined,
                            toX: target + "px",
                            fromY: "0",
                            toY: "0",
                            fromScale: undefined,
                            toScale: undefined,
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
                    target = this.$custsom.translateX / this.$custsom.container.offsetWidth;
                    target = Math.floor(Math.abs(target)) * (target / Math.abs(target));
                    if (this.$custsom.translateX > 0)
                        target += 1;
                    target = target * this.$custsom.container.offsetWidth;

                    AnimationHelper.moveElements([
                        {
                            ele: this.$custsom.itemContainer,
                            timeAndMode: timeAndMode,
                            fromX: undefined,
                            toX: target + "px",
                            fromY: "0",
                            toY: "0",
                            fromScale: undefined,
                            toScale: undefined,
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
                
                if (this.$custsom.translateX <= -this.$custsom.container.offsetWidth * this.listDatas.length) {
                    this.$custsom.translateX = 0;
                    this.$custsom.itemContainer.style.transform = `translate3d(0,0,0)`;
                }

                if (this.$custsom.translateX > 0) {
                    var mod = this.$custsom.container.offsetWidth * this.listDatas.length - this.$custsom.translateX % (this.$custsom.container.offsetWidth * this.listDatas.length);
                    this.currentIndex = Math.floor(<any>(Math.abs(mod) / this.$custsom.container.offsetWidth));
                    this.$custsom.translateX = -this.currentIndex * this.$custsom.container.offsetWidth;
                    this.$custsom.itemContainer.style.transform = `translate3d(${this.$custsom.translateX}px,0,0)`;
                }
                else {
                    var mod = this.$custsom.translateX % (this.$custsom.container.offsetWidth * this.listDatas.length);
                    this.currentIndex = Math.floor(<any>(Math.abs(mod) / this.$custsom.container.offsetWidth));
                }
               
                if (this.autoplay)
                    this.$custsom.autoPlayTimeNumber = window.setTimeout(() => this.autoTranslateToNext(), this.interval);
            },
            resetDatas: function (newValue) {
                //先计算当前停在哪里了
                var mod = this.$custsom.translateX % (this.$custsom.container.offsetWidth * this.listDatas.length);
                var index = Math.floor(<any>(Math.abs(mod) / this.$custsom.container.offsetWidth));

                for (var i = 0; i < newValue.length; i++) {
                    var sitem = newValue[i];
                    if (this.listDatas.length > i) {
                        var titem = this.listDatas[i];
                        if (titem != sitem) {
                            this.listDatas.splice(i, 0, sitem);
                            if (i <= index)
                                this.$custsom.translateX -= this.$custsom.container.offsetWidth;
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

                if (!this.loop && this.currentIndex == this.listDatas.length - 1)
                    return;

                this.$custsom.panStart_translateX = this.$custsom.translateX;
                this.onPanEnd(-1);
            }
        },
        watch: {
            datas: function (newValue, oldValue) {
                console.log("ViewPager datas changed");

                if (this.$custsom.isPanning || this.$custsom.animationning) {
                    this.$custsom.toResetDatas = newValue;
                }
                else {
                    this.resetDatas(newValue);
                }
            },
            autoplay: {
                handler(newVal) {
                    console.log("ViewPager autoplay changed,newValue:" + newVal);
                    if (newVal) {
                        this.$custsom.autoPlayTimeNumber = window.setTimeout(()=>this.autoTranslateToNext(), this.interval);
                    }
                    else {
                        window.clearTimeout(this.$custsom.autoPlayTimeNumber);
                    }
                },
                immediate: true,
            }
        },
        beforeCreate: function () {            
            (<any>this).$custsom = {
                autoPlayTimeNumber: 0
            };
        },
        updated: function () {
            if (this.lastChildrenLength != this.$custsom.itemContainer.children.length) {
                this.lastChildrenLength = this.$custsom.itemContainer.children.length;
                this.calculatorX();
            }
        },
        beforeMount: function () {            

            this.listDatas = [];
            for (var i = 0; i < this.datas.length; i++) {
                this.listDatas.push(this.datas[i]);
            }
        },
        mounted: function () {
            console.log("ViewPager mounted");

            this.$custsom.translateX = 0;
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

                if (ev.type !== "tap" && this.$custsom.autoPlayTimeNumber) {
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
            console.log("ViewPager dispose");
            this.$custsom.container.removeEventListener("touchstart", myTouchStart);
            this.$custsom.resizeListener.dispose();
        }
    });
}