import { AnimationHelper } from "./AnimationHelper";
var Swiper = /** @class */ (function () {
    /**
     *
     * @param container swiper显示的容器
     * @param option
     */
    function Swiper(container, option) {
        var _this = this;
        this.option = {
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
            canRepeat: true,
        };
        this._currentIndex = 0;
        this.imgDivs = [];
        this.lefts = [];
        this._disposed = false;
        this.inited = false;
        if (typeof container === "string") {
            this.container = document.body.querySelector(container);
        }
        else {
            this.container = container;
        }
        for (var p in option) {
            if (option[p] !== undefined)
                this.option[p] = option[p];
        }
        if (this.container.offsetWidth > 0) {
            this.init();
        }
        else {
            var nodeAddedCallback = function (e) {
                //检查container是否已经被添加到body
                var p = _this.container.parentElement;
                while (p && p !== document.body) {
                    p = p.parentElement;
                }
                if (p === document.body) {
                    document.body.removeEventListener("DOMNodeInserted", nodeAddedCallback);
                    _this.init();
                }
            };
            document.body.addEventListener("DOMNodeInserted", nodeAddedCallback, false);
        }
    }
    Object.defineProperty(Swiper.prototype, "currentIndex", {
        get: function () {
            return this._currentIndex;
        },
        set: function (value) {
            if (value >= this.option.imgPaths.length)
                value = 0;
            else if (value < 0)
                value = this.option.imgPaths.length - 1;
            if (value !== this._currentIndex) {
                if (this.paginationContainer) {
                    this.paginationContainer.children[this._currentIndex].style.backgroundColor = this.option.paginationBgColor;
                }
                this._currentIndex = value;
                if (this.paginationContainer) {
                    this.paginationContainer.children[value].style.backgroundColor = this.option.paginationCurrentBgColor;
                }
                if (this.currentIndexChange) {
                    this.currentIndexChange(this, value);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Swiper.prototype.setevent = function () {
        var _this = this;
        var canTouch = true;
        var startX;
        var touching = false;
        var startLeft = [];
        var startScale = [];
        var lastX;
        var positionChanged = true;
        var canMoveForward = true;
        var canMoveBack = true;
        this.touchStartAction = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            if (_this.option.canRepeat == false && _this.currentIndex === _this.option.imgPaths.length - 1)
                canMoveForward = false;
            else
                canMoveForward = true;
            if (_this.option.canRepeat == false && _this.currentIndex === 0)
                canMoveBack = false;
            else
                canMoveBack = true;
            if (canTouch) {
                if (_this._autoplayTimer) {
                    window.clearTimeout(_this._autoplayTimer);
                    _this._autoplayTimer = 0;
                }
                startX = ev.touches[0].clientX;
                lastX = startX;
                touching = true;
                for (var i = 0; i < 5 && i < _this.imgDivs.length; i++) {
                    var div = _this.imgDivs[i];
                    startLeft[i] = div._left;
                    startScale[i] = div._scale;
                }
            }
        };
        var moveHandle = function () {
            if (lastX < startX && canMoveForward == false) {
                lastX = startX;
            }
            if (lastX > startX && canMoveBack == false) {
                lastX = startX;
            }
            for (var i = 0; i < 5 && i < _this.imgDivs.length; i++) {
                var div = _this.imgDivs[i];
                var left = startLeft[i] + lastX - startX;
                var scale = startScale[i];
                if (_this.option.defaultScale < 1) {
                    if (i == 0) {
                        //缩小
                        scale -= 0.2 * Math.abs((_this.lefts[i] - left) / _this.eleImgWidth);
                    }
                    else {
                        //放大
                        scale += 0.2 * Math.abs((_this.lefts[i] - left) / _this.eleImgWidth);
                    }
                    if (i > 1 && i < 5 - 1)
                        scale = 0.8;
                    if (scale < _this.option.defaultScale)
                        scale = _this.option.defaultScale;
                    else if (scale > 1)
                        scale = 1;
                }
                else {
                    scale = 1;
                }
                div.style.transform = "translate3d(" + left + "px,0,0) scale(" + scale + ")";
            }
        };
        this.touchMoveAction = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            if (touching) {
                if (_this.option.onlyForward) {
                    if (ev.touches[0].clientX > startX) {
                        lastX = startX;
                        return;
                    }
                }
                lastX = ev.touches[0].clientX;
                moveHandle();
            }
        };
        this.touchEndAction = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            if (touching) {
                touching = false;
                positionChanged = true;
                if (lastX != startX) {
                    if (lastX < startX) {
                        if (Math.abs(lastX - startX) > _this.eleImgWidth / 4) {
                            moveToLeft();
                        }
                        else {
                            restore();
                            positionChanged = false;
                        }
                    }
                    else {
                        if (Math.abs(lastX - startX) > _this.eleImgWidth / 4) {
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
                    _this.container.focus();
                    if (document.createEvent) {
                        var theEvent = document.createEvent('MouseEvents');
                        theEvent.initEvent('click', true, true);
                        _this.container.dispatchEvent(theEvent);
                    }
                    else if (_this.container.fireEvent) {
                        _this.container.fireEvent('onclick');
                    }
                    if (_this.option.autoPlayInterval > 0) {
                        if (_this._autoplayTimer) {
                            window.clearTimeout(_this._autoplayTimer);
                            _this._autoplayTimer = 0;
                        }
                        _this._autoplayTimer = window.setTimeout(_this.timeAction, _this.option.autoPlayInterval);
                    }
                }
            }
        };
        this.container.addEventListener("touchstart", this.touchStartAction);
        this.container.addEventListener("touchmove", this.touchMoveAction);
        this.container.addEventListener("touchend", this.touchEndAction);
        var onMoveCompleted = function (isMoveLeft) {
            if (positionChanged) {
                //动画结束
                if (isMoveLeft) {
                    //左移1个
                    _this.currentIndex++;
                    var ele = _this.imgDivs.shift();
                    _this.imgDivs.push(ele);
                    var img = _this.option.imgPaths.shift();
                    _this.option.imgPaths.push(img);
                }
                else {
                    //右移1个
                    _this.currentIndex--;
                    var ele = _this.imgDivs.pop();
                    _this.imgDivs.splice(0, 0, ele);
                    var img = _this.option.imgPaths.pop();
                    _this.option.imgPaths.splice(0, 0, img);
                }
                var len = _this.option.imgPaths.length;
                var myImg = [];
                var imgs = [];
                _this.option.imgPaths.forEach(function (item) { return myImg.push(item); });
                //把图片补齐5张
                for (var i = 0, index = len - 1; i < 5 - len; i++) {
                    var img = myImg[index];
                    index++;
                    if (index >= len)
                        index = 0;
                    myImg.push(img);
                }
                imgs = [myImg[0],
                    myImg[1],
                    myImg[2],
                    myImg[myImg.length - 2],
                    myImg[myImg.length - 1],
                ];
                for (var i = 0; i < _this.imgDivs.length; i++) {
                    var div = _this.imgDivs[i];
                    if (_this.option.canRepeat) {
                        if (imgs[i].indexOf("<") === 0) {
                            div.innerHTML = imgs[i];
                        }
                        else {
                            div.style.backgroundImage = "url(" + imgs[i] + ")";
                        }
                    }
                    div._left = _this.lefts[i];
                    if (i > 0) {
                        div._scale = _this.option.defaultScale;
                    }
                    else {
                        div._scale = 1;
                    }
                }
            }
            canTouch = true;
            if (_this.option.autoPlayInterval > 0) {
                if (_this._autoplayTimer) {
                    window.clearTimeout(_this._autoplayTimer);
                    _this._autoplayTimer = 0;
                }
                _this._autoplayTimer = window.setTimeout(_this.timeAction, _this.option.autoPlayInterval);
            }
        };
        var moveToLeft = function () {
            positionChanged = true;
            var tomoveEles = [_this.imgDivs[0], _this.imgDivs[1], _this.imgDivs[2], _this.imgDivs[_this.imgDivs.length - 1]];
            var completedCount = 0;
            var completeCallBack = function () {
                completedCount++;
                if (completedCount == tomoveEles.length) {
                    onMoveCompleted(true);
                }
            };
            for (var i = 0; i < tomoveEles.length; i++) {
                var div = tomoveEles[i];
                var toX = div._left - (_this.eleImgWidth - _this.moveleftFlag);
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
        var moveToRight = function () {
            positionChanged = true;
            var tomoveEles = [_this.imgDivs[0], _this.imgDivs[1], _this.imgDivs[_this.imgDivs.length - 1], _this.imgDivs[_this.imgDivs.length - 2]];
            var completedCount = 0;
            var completeCallBack = function () {
                completedCount++;
                if (completedCount == tomoveEles.length) {
                    onMoveCompleted(false);
                }
            };
            for (var i = 0; i < tomoveEles.length; i++) {
                var div = tomoveEles[i];
                var toX = div._left + (_this.eleImgWidth - _this.moveleftFlag);
                var toScale = 0.8;
                if (i == 2) {
                    toScale = 1;
                }
                AnimationHelper.moveElement(div, "0.25s linear", undefined, toX + "px", "0", "0", undefined, toScale, true, completeCallBack);
            }
        };
        var restore = function () {
            positionChanged = false;
            var tomoveEles = [_this.imgDivs[0], _this.imgDivs[1], _this.imgDivs[2], _this.imgDivs[_this.imgDivs.length - 1], _this.imgDivs[_this.imgDivs.length - 2]];
            var completedCount = 0;
            var completeCallBack = function () {
                completedCount++;
                if (completedCount == tomoveEles.length) {
                    onMoveCompleted(false);
                }
            };
            for (var i = 0; i < tomoveEles.length; i++) {
                var div = tomoveEles[i];
                var toX = div._left;
                var toScale = 0.8;
                if (i == 0) {
                    toScale = 1;
                }
                AnimationHelper.moveElement(div, "0.25s linear", undefined, toX + "px", "0", "0", undefined, toScale, true, completeCallBack);
            }
        };
        this.timeAction = function () {
            _this._autoplayTimer = 0;
            if (_this._disposed)
                return;
            if (!touching) {
                canTouch = false;
                var tomoveEles = [_this.imgDivs[0], _this.imgDivs[1], _this.imgDivs[2], _this.imgDivs[_this.imgDivs.length - 1]];
                var completedCount = 0;
                var completeCallBack = function () {
                    completedCount++;
                    if (completedCount == tomoveEles.length) {
                        onMoveCompleted(true);
                    }
                };
                for (var i = 0; i < tomoveEles.length; i++) {
                    var div = tomoveEles[i];
                    var fromX = div._left;
                    var toX = fromX - (_this.eleImgWidth - _this.moveleftFlag);
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
                if (_this.option.autoPlayInterval > 0) {
                    if (_this._autoplayTimer) {
                        window.clearTimeout(_this._autoplayTimer);
                        _this._autoplayTimer = 0;
                    }
                    _this._autoplayTimer = window.setTimeout(_this.timeAction, _this.option.autoPlayInterval);
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
    };
    Swiper.prototype.dispose = function () {
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
    };
    Swiper.prototype.stop = function () {
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
    };
    /**开始自动播放 */
    Swiper.prototype.start = function () {
        if (this._autoplayTimer == 0) {
            this.option.autoPlayInterval = this._autoPlayInterval;
            if (this.option.autoPlayInterval > 0) {
                this._autoplayTimer = window.setTimeout(this.timeAction, this.option.autoPlayInterval);
            }
        }
        console.debug("swiper start");
    };
    Swiper.prototype.init = function () {
        if (this.inited || this.option.imgPaths.length == 0)
            return;
        this.inited = true;
        this.setevent();
        if (this.option.marginPercent <= 0 || this.option.defaultScale == 1) {
            this.option.defaultScale = 1;
            this.option.marginPercent = 0;
        }
        if (this.option.onlyForward)
            this.option.canRepeat = false;
        var margin = parseInt((this.container.offsetWidth * this.option.marginPercent));
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
        this.option.imgPaths.forEach(function (item) { return myImg.push(item); });
        //把图片补齐5张
        for (var i = 0, index = len - 1; i < 5 - len; i++) {
            var img = myImg[index];
            index++;
            if (index >= len)
                index = 0;
            myImg.push(img);
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
                div._scale = this.option.defaultScale;
            }
            else {
                div.style.transform = "translate3d(" + this.lefts[i] + "px,0,0)";
                div._scale = 1;
            }
            div._left = this.lefts[i];
            this.container.appendChild(div);
        }
        if (this.option.showPagination) {
            var w = this.option.paginationSize * this.option.imgPaths.length + this.option.paginationMargin * (this.option.imgPaths.length - 1);
            var div = document.createElement("DIV");
            div.style.position = "absolute";
            div.style.bottom = this.option.paginationBottom + "px";
            div.style.left = (this.container.offsetWidth - w) / 2 + "px";
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
    };
    return Swiper;
}());
export { Swiper };
//# sourceMappingURL=Swiper.js.map