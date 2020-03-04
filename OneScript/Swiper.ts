import { AnimationHelper } from "./AnimationHelper";
import { clearTimeout } from "timers";

export interface SwiperOption {
    /**图片路径，也可以是html代码 */
    imgPaths: string[];
    /**图片的原始宽度 */
    imgWidth: number;
    /**图片的原始高度 */
    imgHeight: number;
    /**图片显示时，距离左右边框的距离 ，默认为0.056（Swiper宽度的5.6%） */
    marginPercent?: number;
    /**其他图片默认缩放比例，默认为0.8 */
    defaultScale?: number;
    /**图片的圆角处理，默认为：0 */
    borderRadius?: number;
    /**图片元素的样式 */
    imgClass?: string;

    /**是否显示分页器 */
    showPagination?: boolean;
    /**分页器背景色 默认：rgba(255,255,255,0.4)*/
    paginationBgColor?: string;
    /**分页器选中页的背景色 默认：rgba(255,255,255,0.9)*/
    paginationCurrentBgColor?: string;
    /**分页器间隔，默认：7 */
    paginationMargin?: number;
    /**分页器大小，默认：8 */
    paginationSize?: number;
    /**分页器距离下边框的距离，默认：10 */
    paginationBottom?: number;
    /**自动播放时间（毫秒），默认：5000，设置为0表示不播放 */
    autoPlayInterval?: number;
    /**手动滑动时，是否只允许往下一副图片滑动 */
    onlyForward?: boolean;
    /**是否允许循环，默认true */
    canRepeat?: boolean;
}

export class Swiper {
    container: HTMLElement;
    currentIndexChange: (sender, index) => void;
    option: SwiperOption = {
        imgPaths: [],
        marginPercent: 0.056,
        imgWidth: 0,
        imgHeight: 0,
        defaultScale: 0.8,
        borderRadius: 0,
        showPagination: true,
        paginationBgColor: "rgba(255,255,255,0.4)",
        paginationCurrentBgColor: "rgba(255,255,255,0.9)",
        paginationMargin: 7,
        paginationSize: 8,
        paginationBottom: 10,
        autoPlayInterval: 5000,
        onlyForward: false,
        canRepeat:true,
    };
    set currentIndex(value: number) {
        if (value >= this.option.imgPaths.length)
            value = 0;
        else if (value < 0)
            value = this.option.imgPaths.length - 1;

        if (value !== this._currentIndex) {
            if (this.paginationContainer) {
                (<HTMLElement>this.paginationContainer.children[this._currentIndex]).style.backgroundColor = this.option.paginationBgColor;
            }

            this._currentIndex = value;
            if (this.paginationContainer) {
                (<HTMLElement>this.paginationContainer.children[value]).style.backgroundColor = this.option.paginationCurrentBgColor;
            }
            if (this.currentIndexChange) {
                this.currentIndexChange(this, value);
            }
        }
    }
    get currentIndex(): number {
        return this._currentIndex;
    }
    private _currentIndex: number = 0;
    private eleImgWidth: number;
    private imgDivs: HTMLElement[] = [];
    private lefts: number[] = [];
    private moveleftFlag: number;

    private paginationContainer: HTMLElement;

    private touchStartAction: (ev: TouchEvent) => void;
    private touchMoveAction: (ev: TouchEvent) => void;
    private touchEndAction: (ev: TouchEvent) => void;
    private timeAction: () => void;
    /**
     * 
     * @param container swiper显示的容器
     * @param option
     */
    constructor(container: Element | string, option: SwiperOption) {
        
        if (typeof container === "string") {
            this.container = document.body.querySelector(container);
        }
        else {
            this.container = <HTMLElement>container;
        }

       

        for (var p in option) {
            if (option[p] !== undefined)
                this.option[p] = option[p];
        }

        if (this.container.offsetWidth > 0) {
            this.init();
        }
        else {
            var checkWidth = (p) => {
                if (this.container.offsetWidth > 0) {
                    this.init();
                    return;
                }
                else {
                    window.requestAnimationFrame(checkWidth);
                }
            };
            window.requestAnimationFrame(checkWidth);
        }
 
    }

    private setevent() {
        var canTouch = true;
        var startX;
        var touching = false;
        var startLeft = [];
        var startScale = [];
        var lastX;
        var positionChanged = true;
        var canMoveForward = true;
        var canMoveBack = true;
        var touchStartTime;

        var animationing = false;

        this.touchStartAction = (ev) => {
            if (ev.cancelable) {
                ev.stopPropagation();
                ev.preventDefault();
            }

            if (animationing)
                return;

            touchStartTime = new Date().getTime();
            if (this.option.canRepeat == false && this.currentIndex === this.option.imgPaths.length - 1)
                canMoveForward = false;
            else
                canMoveForward = true;

            if (this.option.canRepeat == false && this.currentIndex === 0)
                canMoveBack = false;
            else
                canMoveBack = true;

            if (canTouch ) {
                if (this._autoplayTimer) {
                    window.clearTimeout(this._autoplayTimer);
                    this._autoplayTimer = 0;
                }
                startX = ev.touches[0].clientX;
                lastX = startX;
                touching = true;
                for (var i = 0; i < 5 && i < this.imgDivs.length; i++) {
                    var div = this.imgDivs[i];
                    startLeft[i] = (<any>div)._left;
                    startScale[i] = (<any>div)._scale;
                }
            }
        };


        var moveHandle = () => {
            if (lastX < startX && canMoveForward == false) {
                lastX = startX;
            }
            if (lastX > startX && canMoveBack == false) {
                lastX = startX;
            }
            for (var i = 0; i < 5 && i < this.imgDivs.length; i++) {
                var div = this.imgDivs[i];
                var left = startLeft[i] + lastX - startX;
                var scale = startScale[i];
                if (this.option.defaultScale < 1) {
                    if (i == 0) {
                        //缩小
                        scale -= 0.2 * Math.abs((this.lefts[i] - left) / this.eleImgWidth);
                    }
                    else {
                        //放大
                        scale += 0.2 * Math.abs((this.lefts[i] - left) / this.eleImgWidth);
                    }

                    if (i > 1 && i < 5 - 1)
                        scale = 0.8;

                    if (scale < this.option.defaultScale)
                        scale = this.option.defaultScale;
                    else if (scale > 1)
                        scale = 1;
                }
                else {
                    scale = 1;
                }
                
                div.style.transform = "translate3d(" + left + "px,0,0) scale(" + scale + ")";
            }
        };

      
        this.touchMoveAction = (ev) => {
            if (ev.cancelable) {
                ev.stopPropagation();
                ev.preventDefault();
            }
           
            if (touching) {
                if (this.option.onlyForward) {
                    if (ev.touches[0].clientX > startX) {
                        lastX = startX;
                        return;
                    }
                }
                lastX = ev.touches[0].clientX;
                moveHandle();
            }
        };
        this.touchEndAction = (ev) => {
            if (ev.cancelable) {
                ev.stopPropagation();
                ev.preventDefault();
            }

            if (touching) {
                touching = false;

                positionChanged = true;
                if (lastX != startX) {
                    if (lastX < startX) {
                        if (Math.abs(lastX - startX) > this.eleImgWidth / 4 || (Math.abs(lastX - startX) > 5 && new Date().getTime() - touchStartTime < 200)  ) {
                            moveToLeft();
                        }
                        else {
                            restore();
                            positionChanged = false;
                        }
                    }
                    else {
                        if (Math.abs(lastX - startX) > this.eleImgWidth / 4 || (Math.abs(lastX - startX) > 5 && new Date().getTime() - touchStartTime < 200)   ) {
                            moveToRight();
                        }
                        else {
                            restore();
                            positionChanged = false;
                        }
                    }
                }
                else {

                    //触发click
                    this.container.focus();
                    if (document.createEvent) {
                        var theEvent = document.createEvent('MouseEvents');
                        theEvent.initEvent('click', true, true);

                        this.container.dispatchEvent(theEvent);
                    } else if ((<any>this.container).fireEvent) {
                        (<any>this.container).fireEvent('onclick');
                    }

                    if (this.option.autoPlayInterval > 0) {
                        if (this._autoplayTimer) {
                            window.clearTimeout(this._autoplayTimer);
                            this._autoplayTimer = 0;
                        }
                        this._autoplayTimer = window.setTimeout(this.timeAction, this.option.autoPlayInterval);
                    }
                }
            }
        };

        this.container.addEventListener("touchstart", this.touchStartAction);
        this.container.addEventListener("touchmove", this.touchMoveAction);
        this.container.addEventListener("touchend", this.touchEndAction);


        var onMoveCompleted = (isMoveLeft: boolean) => {
            if (positionChanged) {
                //动画结束
                if (isMoveLeft) {
                    //左移1个
                    this.currentIndex++;

                    var ele = this.imgDivs.shift();
                    this.imgDivs.push(ele);

                    var img = this.option.imgPaths.shift();
                    this.option.imgPaths.push(img);
                }
                else {
                    //右移1个
                    this.currentIndex--;

                    var ele = this.imgDivs.pop();
                    this.imgDivs.splice(0, 0, ele);

                    var img = this.option.imgPaths.pop();
                    this.option.imgPaths.splice(0, 0, img);
                }


                var len = this.option.imgPaths.length;
                var myImg = [];
                var imgs = [];
                this.option.imgPaths.forEach((item) => myImg.push(item));
                //把图片补齐3张
                if (myImg.length < 3) {
                    var startindex = 0;
                    var docount = 3 - myImg.length;
                    for (var i = 0; i < docount; i++) {
                        myImg.push(myImg[startindex]);
                        startindex++;
                        if (startindex == myImg.length)
                            startindex = 0;
                    }
                }

                imgs = [myImg[0],
                myImg[1],
                myImg[2],
                myImg[myImg.length - 2],
                myImg[myImg.length - 1],
                ];

                for (var i = 0; i < this.imgDivs.length; i++) {
                    var div = this.imgDivs[i];

                    if (this.option.canRepeat) {
                        if (imgs[i].indexOf("<") === 0) {
                            div.innerHTML = imgs[i];
                        }
                        else {
                            div.style.backgroundImage = "url(" + imgs[i] + ")";
                        }
                    }


                    (<any>div)._left = this.lefts[i];
                    if (i > 0) {
                        (<any>div)._scale = this.option.defaultScale;
                    }
                    else {
                        (<any>div)._scale = 1;
                    }

                }
            }
            canTouch = true;
            if (this.option.autoPlayInterval > 0) {
                if (this._autoplayTimer) {
                    window.clearTimeout(this._autoplayTimer);
                    this._autoplayTimer = 0;
                }
                this._autoplayTimer = window.setTimeout(this.timeAction, this.option.autoPlayInterval);
            }
        };

        var moveToLeft = () => {
           
            positionChanged = true;
            var tomoveEles = [this.imgDivs[0], this.imgDivs[1], this.imgDivs[2], this.imgDivs[this.imgDivs.length - 1]];
            var completedCount = 0;

            var completeCallBack = () => {
                completedCount++;
                if (completedCount == tomoveEles.length) {
                    onMoveCompleted(true);
                    animationing = false;
                }
            };

            if (tomoveEles.length > 0) {
                animationing = true;
            }

            for (var i = 0; i < tomoveEles.length; i++) {
                var div = tomoveEles[i];
                var toX = (<any>div)._left - (this.eleImgWidth - this.moveleftFlag);

                var toScale = 0.8;
                if (i == 1) {
                    toScale = 1;
                }
                else if (i == 0) {
                    toScale = 0.8;
                }
               
                AnimationHelper.moveElement(div, "0.25s linear", undefined, toX + "px", "0", "0", undefined, toScale, true, completeCallBack);
            }
        };

        var moveToRight = () => {
           
            positionChanged = true;
            var tomoveEles = [this.imgDivs[0], this.imgDivs[1], this.imgDivs[this.imgDivs.length - 1], this.imgDivs[this.imgDivs.length - 2]];
            var completedCount = 0;

            var completeCallBack = () => {
                completedCount++;
                if (completedCount == tomoveEles.length) {
                    onMoveCompleted(false);
                    animationing = false;
                }
            };

            if (tomoveEles.length > 0) {
                animationing = true;
            }

            for (var i = 0; i < tomoveEles.length; i++) {
                var div = tomoveEles[i];
                var toX = (<any>div)._left + (this.eleImgWidth - this.moveleftFlag);
                var toScale = 0.8;

                if (i == 2) {
                    toScale = 1;
                }
                AnimationHelper.moveElement(div, "0.25s linear", undefined, toX + "px", "0", "0", undefined, toScale, true, completeCallBack);
            }
        };

        var restore = () => {
            

            positionChanged = false;
            var tomoveEles = [this.imgDivs[0], this.imgDivs[1], this.imgDivs[2], this.imgDivs[this.imgDivs.length - 1], this.imgDivs[this.imgDivs.length - 2]];
            var completedCount = 0;

            var completeCallBack = () => {
                completedCount++;
                if (completedCount == tomoveEles.length) {
                    onMoveCompleted(false);
                    animationing = false;
                }
            };

            if (tomoveEles.length > 0) {
                animationing = true;
            }

            for (var i = 0; i < tomoveEles.length; i++) {
                var div = tomoveEles[i];
                var toX = (<any>div)._left;
                var toScale = 0.8;

                if (i == 0) {
                    toScale = 1;
                }
                AnimationHelper.moveElement(div, "0.25s linear", undefined, toX + "px", "0", "0", undefined, toScale, true, completeCallBack);
            }
        };

        this.timeAction = () => {
            this._autoplayTimer = 0;
            if (this._disposed)
                return;

            if (!touching) {
                canTouch = false;
                var tomoveEles = [this.imgDivs[0], this.imgDivs[1], this.imgDivs[2], this.imgDivs[this.imgDivs.length - 1]];
                var completedCount = 0;

                var completeCallBack = () => {
                    completedCount++;
                    if (completedCount == tomoveEles.length) {
                        onMoveCompleted(true);
                    }
                };
                for (var i = 0; i < tomoveEles.length; i++) {
                    var div = tomoveEles[i];
                    var fromX = (<any>div)._left;
                    var toX = fromX - (this.eleImgWidth - this.moveleftFlag);

                    var fromScale = 0.8, toScale = 0.8;
                    if (i == 1) {
                        fromScale = 0.8;
                        toScale = 1;
                    }
                    else if (i == 0) {
                        fromScale = 1;
                        toScale = 0.8;
                    }
                    AnimationHelper.moveElement(div, "0.5s linear", fromX + "px", toX + "px", "0", "0", fromScale, toScale, true, completeCallBack);
                }
            }
            else {
                if (this.option.autoPlayInterval > 0) {
                    if (this._autoplayTimer) {
                        window.clearTimeout(this._autoplayTimer);
                        this._autoplayTimer = 0;
                    }
                    this._autoplayTimer = window.setTimeout(this.timeAction, this.option.autoPlayInterval);
                }
            }
        };

        if (this.option.autoPlayInterval > 0) {
            if (this._autoplayTimer) {
                window.clearTimeout(this._autoplayTimer);
                this._autoplayTimer = 0;
            }
            this._autoplayTimer = window.setTimeout(this.timeAction, this.option.autoPlayInterval);
        }
    }

    private _autoplayTimer: any;
    private _disposed = false;
    dispose() {
        this.stop();
        this.container.removeEventListener("touchstart", this.touchStartAction);
        this.container.removeEventListener("touchmove", this.touchMoveAction);
        this.container.removeEventListener("touchend", this.touchEndAction);

        this._disposed = true;
        for (var i = 0; i < this.imgDivs.length; i++) {
            this.container.removeChild(this.imgDivs[i]);
        }
        if (this.paginationContainer)
            this.container.removeChild(this.paginationContainer);
        this.container = null;
    }

    /**停止自动播放 */
    private _autoPlayInterval: number;
    stop() {
        if (this.option.autoPlayInterval > 0) {
            this._autoPlayInterval = this.option.autoPlayInterval;
            this.option.autoPlayInterval = 0;
            if (this._autoplayTimer) {
                window.clearTimeout(this._autoplayTimer);
                this._autoplayTimer = 0;
            }
            this._autoplayTimer = 0;
        }
        console.debug("swiper stop");
    }
    /**开始自动播放 */
    start() {
        if (!this.inited) {
            window.setTimeout(() => this.start(), 1000);
            return;
        }
        if (this._autoplayTimer == 0) {
            this.option.autoPlayInterval = this._autoPlayInterval;
            if (this.option.autoPlayInterval > 0) {
                this._autoplayTimer = window.setTimeout(this.timeAction, this.option.autoPlayInterval);
            }
        }
        console.debug("swiper start");
    }

    private inited = false;
    private init() {
        if (this.inited || this.option.imgPaths.length == 0)
            return;
        this.inited = true;
        

        this.setevent();

        this.container.style.overflow = "hidden";

        if (this.option.marginPercent <= 0 || this.option.defaultScale == 1) {
            this.option.defaultScale = 1;
            this.option.marginPercent = 0;
        }
        if (this.option.onlyForward)
            this.option.canRepeat = false;

        var margin = parseInt( <any>(this.container.offsetWidth * this.option.marginPercent));

        this.eleImgWidth = this.container.offsetWidth - margin * 2;
        if (this.option.imgHeight && this.option.imgWidth && this.option.defaultScale < 1) {
            this.container.style.height = (this.option.imgHeight * this.eleImgWidth) / this.option.imgWidth + "px";
        }
        else {
            this.option.defaultScale = 1;
            margin = 0;
        }

        this.container.style.position = "relative";

        var moveleft = this.eleImgWidth * (1 - this.option.defaultScale) / 2 - margin / 2;
       
        this.moveleftFlag = moveleft;

        this.lefts = [margin,
            this.container.offsetWidth - margin - moveleft,
            this.container.offsetWidth - margin - moveleft + this.eleImgWidth - moveleft,
            margin - this.eleImgWidth + moveleft - this.eleImgWidth + moveleft,
            margin - this.eleImgWidth + moveleft,
        ];

        var len = this.option.imgPaths.length;
        var myImg = [];
        var imgs = [];
        this.option.imgPaths.forEach((item) => myImg.push(item));

        //把图片补齐3张
        if (myImg.length < 3) {
            var startindex = 0;
            var docount = 3 - myImg.length;
            for (var i = 0; i < docount; i++) {
                myImg.push(myImg[startindex]);
                startindex++;
                if (startindex == myImg.length)
                    startindex = 0;
            }
        }

        imgs = [myImg[0],
        myImg[1],
        myImg[2],
        myImg[myImg.length - 2],
        myImg[myImg.length - 1],
        ];

        for (var i = 0; i < this.lefts.length && i < imgs.length; i++) {
            var div = document.createElement("DIV");
            this.imgDivs[i] = div;
            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.height = "100%";
            div.style.width = this.eleImgWidth + "px";
            if (imgs[i].indexOf("<") === 0) {
                div.innerHTML = imgs[i];
            }
            else {
                div.style.backgroundImage = "url(" + imgs[i] + ")";
                div.style.backgroundSize = "100% 100%";
                div.style.backgroundRepeat = "no-repeat";
            }
            div.style.left = "0px";

            if (this.option.borderRadius > 0) {
                div.style.borderRadius = this.option.borderRadius + "px";
            }
            if (this.option.imgClass) {
                div.className = this.option.imgClass;
            }
            if (i > 0) {
                div.style.transform = "translate3d(" + this.lefts[i] + "px,0,0) scale(" + this.option.defaultScale + ")";
                (<any>div)._scale = this.option.defaultScale;
            }
            else {
                div.style.transform = "translate3d(" + this.lefts[i] + "px,0,0)";
                (<any>div)._scale = 1;
            }
            (<any>div)._left = this.lefts[i];

            this.container.appendChild(div);
        }

        if (this.option.showPagination) {
            var w = this.option.paginationSize * this.option.imgPaths.length + this.option.paginationMargin * (this.option.imgPaths.length - 1);

            var div = document.createElement("DIV");
            div.style.position = "absolute";
            div.style.bottom = this.option.paginationBottom + "px";
            div.style.left = (this.container.offsetWidth - w)/2 + "px";
            this.container.appendChild(div);
            this.paginationContainer = div;

            for (var i = 0; i < this.option.imgPaths.length; i++) {
                div = document.createElement("DIV");
                div.style.cssFloat = "left";
                div.style.width = this.option.paginationSize + "px";
                div.style.height = this.option.paginationSize + "px";
                div.style.backgroundColor = i === 0 ? this.option.paginationCurrentBgColor : this.option.paginationBgColor;
                div.style.borderRadius = this.option.paginationSize + "px";
                if (i > 0)
                    div.style.marginLeft = this.option.paginationMargin + "px";
                this.paginationContainer.appendChild(div);
            }
        }
    }
}