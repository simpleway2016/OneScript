var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Component } from "./Component";
var NavigationEvent = /** @class */ (function () {
    function NavigationEvent() {
    }
    NavigationEvent.OnBeforePush = 3;
    NavigationEvent.OnBeforePop = 4;
    NavigationEvent.OnComponentPushed = 1;
    NavigationEvent.OnComponentPoped = 2;
    return NavigationEvent;
}());
export { NavigationEvent };
var NavigationEventHandler = /** @class */ (function () {
    function NavigationEventHandler() {
    }
    return NavigationEventHandler;
}());
var Navigation = /** @class */ (function (_super) {
    __extends(Navigation, _super);
    function Navigation() {
        var _this = _super.call(this, "") || this;
        /**目前显示的队列*/
        _this.queue = [];
        _this.eventHandlers = [];
        _this.element.style.width = "100%";
        _this.element.style.height = "100%";
        _this.element.style.position = "relative";
        Navigation.initAnimationKeyframe();
        return _this;
    }
    /**
     * 触发一个事件
     * @param eventType
     */
    Navigation.prototype.rasieEvent = function (eventType, component) {
        for (var i = 0; i < this.eventHandlers.length; i++) {
            try {
                if (this.eventHandlers[i].event == eventType)
                    this.eventHandlers[i].action(component);
            }
            catch (e) {
            }
        }
    };
    Navigation.prototype.addEventListener = function (eventType, func) {
        var handler = new NavigationEventHandler();
        handler.event = eventType;
        handler.action = func;
        this.eventHandlers.push(handler);
    };
    Navigation.prototype.removeEventListener = function (eventType, func) {
        var ret = this.eventHandlers.filter(function (item) { return item.event === eventType && item.action === func; });
        for (var i = 0; i < ret.length; i++) {
            var index = this.eventHandlers.indexOf(ret[i]);
            this.eventHandlers.splice(index, 1);
        }
    };
    ///**
    // * 关联android返回键
    // * */
    //connectBackKey() {
    //    window.history.pushState(null, null, "#");
    //    window.addEventListener("popstate", ()=> {
    //        //用户点击了返回键
    //        if (this.queue.length > 1) {                
    //            this.pop(true);                
    //        }
    //        if (this.queue.length > 0) {
    //            window.history.pushState(null, null, "#");
    //        }
    //    })
    //}
    /**
     *
     * @param component
     */
    Navigation.prototype.preload = function (component) {
        component.element.style.position = "absolute";
        component.element.style.left = "0px";
        component.element.style.top = "0px";
        component.element.style.width = "100%";
        component.element.style.height = "100%";
        component.setParent(this.element);
    };
    /**
     * 卸载组件
     * @param component 可以是组件实例或者组件的类型
     */
    Navigation.prototype.unload = function (component) {
        try {
            this.element.removeChild(component.element);
        }
        catch (e) {
        }
        var index = this.queue.indexOf(component);
        if (index < 0)
            return;
        this.queue.splice(index, 1);
    };
    Navigation.prototype.moveComponentTogether = function (c1, start1, end1, c2, start2, end2, callback) {
        var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        var flag1 = Math.abs(parseInt(((start1 - end1) / (60 * 0.25))));
        var flag2 = Math.abs(parseInt(((start2 - end2) / (60 * 0.25))));
        if (flag1 == 0)
            flag1 = 1;
        if (flag2 == 0)
            flag2 = 1;
        var action = function (time) {
            if (start1 > end1) {
                start1 -= flag1;
                if (start1 < end1)
                    start1 = end1;
            }
            else {
                start1 += flag1;
                if (start1 > end1)
                    start1 = end1;
            }
            c1.element.style.transform = "translate3d(" + start1 + "%,0,0)";
            if (c2) {
                if (start2 > end2) {
                    start2 -= flag2;
                    if (start2 < end2)
                        start2 = end2;
                }
                else {
                    start2 += flag2;
                    if (start2 > end2)
                        start2 = end2;
                }
                c2.element.style.transform = "translate3d(" + start2 + "%,0,0)";
            }
            if (start1 != end1)
                animationFrame(action);
            else {
                if (c2)
                    c2.element.style.transform = "translate3d(0%,0,0)";
                if (callback)
                    callback();
            }
        };
        animationFrame(action);
    };
    /**加入动画的keyframes到head */
    Navigation.initAnimationKeyframe = function () {
        if (Navigation.keyindex > 1)
            return;
        //100% to 0%
        var from = "100%";
        var to = "0%";
        var keyname = "_animation_keyframe_" + (Navigation.keyindex++) + "_" + new Date().getTime();
        var keyframeStyle = document.createElement("STYLE");
        var innerHTML = "@keyframes " + keyname + " {from {transform: translate3d(" + from + ", 0px,0);}to{transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-moz-keyframes " + keyname + " {from {-moz-transform: translate3d(" + from + ", 0px,0);}to{-moz-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-webkit-keyframes " + keyname + " {from {-webkit-transform: translate3d(" + from + ", 0px,0);}to{-webkit-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-o-keyframes " + keyname + " {from {-o-transform: translate3d(" + from + ", 0px,0);}to{-o-transform: translate3d(" + to + ", 0px,0);}}\r\n";
        Navigation.keyframNames["100%to0%"] = keyname;
        //0% to 100%
        from = "0%";
        to = "100%";
        keyname = "_animation_keyframe_" + (Navigation.keyindex++) + "_" + new Date().getTime();
        innerHTML += "@keyframes " + keyname + " {from {transform: translate3d(" + from + ", 0px,0);}to{transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-moz-keyframes " + keyname + " {from {-moz-transform: translate3d(" + from + ", 0px,0);}to{-moz-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-webkit-keyframes " + keyname + " {from {-webkit-transform: translate3d(" + from + ", 0px,0);}to{-webkit-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-o-keyframes " + keyname + " {from {-o-transform: translate3d(" + from + ", 0px,0);}to{-o-transform: translate3d(" + to + ", 0px,0);}}\r\n";
        Navigation.keyframNames["0%to100%"] = keyname;
        //0% to -20%
        from = "0%";
        to = "-20%";
        keyname = "_animation_keyframe_" + (Navigation.keyindex++) + "_" + new Date().getTime();
        innerHTML += "@keyframes " + keyname + " {from {transform: translate3d(" + from + ", 0px,0);}to{transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-moz-keyframes " + keyname + " {from {-moz-transform: translate3d(" + from + ", 0px,0);}to{-moz-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-webkit-keyframes " + keyname + " {from {-webkit-transform: translate3d(" + from + ", 0px,0);}to{-webkit-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-o-keyframes " + keyname + " {from {-o-transform: translate3d(" + from + ", 0px,0);}to{-o-transform: translate3d(" + to + ", 0px,0);}}\r\n";
        Navigation.keyframNames["0%to-20%"] = keyname;
        // -20% to 0% 
        from = "-20%";
        to = "0%";
        keyname = "_animation_keyframe_" + (Navigation.keyindex++) + "_" + new Date().getTime();
        innerHTML += "@keyframes " + keyname + " {from {transform: translate3d(" + from + ", 0px,0);}to{transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-moz-keyframes " + keyname + " {from {-moz-transform: translate3d(" + from + ", 0px,0);}to{-moz-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-webkit-keyframes " + keyname + " {from {-webkit-transform: translate3d(" + from + ", 0px,0);}to{-webkit-transform: translate3d(" + to + ", 0px,0);}}\r\n" +
            "@-o-keyframes " + keyname + " {from {-o-transform: translate3d(" + from + ", 0px,0);}to{-o-transform: translate3d(" + to + ", 0px,0);}}\r\n";
        Navigation.keyframNames["-20%to0%"] = keyname;
        keyframeStyle.innerHTML = innerHTML;
        document.head.appendChild(keyframeStyle);
    };
    Navigation.prototype.moveComponent = function (component, from, to, keepValue, callback) {
        component.element.style.transform = "translate3d(" + from + ",0px,0)";
        component.element.style.webkitTransform = "translate3d(" + from + ",0px,0)";
        var keyname = Navigation.keyframNames[from + "to" + to];
        var funcEnd = function () {
            if (keepValue) {
                component.element.style.transform = "translate3d(" + to + ",0px,0)";
                component.element.style.webkitTransform = "translate3d(" + to + ",0px,0)";
            }
            else {
                component.element.style.transform = "";
                component.element.style.webkitTransform = "";
            }
            component.element.style.animation = "";
            component.element.style.webkitAnimation = "";
            component.element.removeEventListener("webkitAnimationEnd", funcEnd);
            component.element.removeEventListener("animationend", funcEnd);
            if (callback)
                callback();
        };
        // Chrome, Safari 和 Opera 代码
        component.element.addEventListener("webkitAnimationEnd", funcEnd);
        // 标准语法
        component.element.addEventListener("animationend", funcEnd);
        component.element.style.animation = keyname + " 0.3s ease-out";
        component.element.style.webkitAnimation = keyname + " 0.3s ease-out";
        component.element.style.animationFillMode = "forwards"; //这两句代码必须放在animation赋值的后面
        component.element.style.webkitAnimationFillMode = "forwards";
    };
    /**
     * 把component提到最前面显示
     * @param component
     */
    Navigation.prototype.bringToFront = function (component) {
        if (this.queue.length === 0 || !component || component === this.queue[this.queue.length - 1])
            return;
        var lastComponent = this.queue[this.queue.length - 1];
        if (lastComponent.element.parentElement !== component.element.parentElement)
            return;
        lastComponent.onNavigationUnActived(false);
        var index = this.queue.indexOf(component);
        if (index < 0)
            return;
        this.queue.splice(index, 1);
        this.queue.push(component);
        this.element.removeChild(component.element);
        this.element.appendChild(component.element);
        component.onNavigationActived(true);
    };
    /**
     * 显示组件
     * @param component
     * @param animation 是否有动画过渡
     * @param callback 动画完成后的回调方法
     */
    Navigation.prototype.push = function (curComponent, animation, callback) {
        var _this = this;
        if (animation === void 0) { animation = true; }
        if (callback === void 0) { callback = null; }
        //需要设置zIndex，否则，如果另一个Component里面的子元素有更高zIndex，则会覆盖这个curComponent
        curComponent.element.style.zIndex = "1";
        curComponent.element.style.position = "absolute";
        curComponent.element.style.left = "0px";
        curComponent.element.style.top = "0px";
        curComponent.element.style.width = "100%";
        curComponent.element.style.height = "100%";
        if (this.pushing) {
            if (this.pushing.constructor == curComponent.constructor) //禁止同一个component被连续push
                return;
            window.setTimeout(function () {
                _this.push(curComponent, animation, callback);
            }, 500);
            return;
        }
        curComponent.owner = this;
        for (var i = 0; i < this.eventHandlers.length; i++) {
            try {
                if (this.eventHandlers[i].event == NavigationEvent.OnBeforePush) {
                    var handled = this.eventHandlers[i].action(curComponent);
                    if (handled === true) {
                        curComponent.dispose();
                        return;
                    }
                }
            }
            catch (e) {
            }
        }
        if (curComponent.animationOnNavigation == false) {
            animation = false;
        }
        var preComponent = null;
        if (this.queue.length > 0) {
            try {
                preComponent = this.queue[this.queue.length - 1];
            }
            catch (e) {
            }
        }
        //if (this.components.indexOf(curComponent) < 0)
        this.preload(curComponent);
        //设置z-index
        this.queue.push(curComponent);
        //for (var i = 0; i < this.queue.length; i++) {
        //    this.queue[i].element.style.zIndex = (i + 1).toString();
        //}
        if (preComponent) {
            preComponent.onNavigationUnActived(false);
        }
        this.pushing = curComponent;
        var animationEndFunc = function () {
            Component.setBodyDisabled(false);
            try {
                curComponent.onNavigationPushed();
            }
            catch (e) {
            }
            try {
                curComponent.onNavigationActived(false);
            }
            catch (e) {
            }
            for (var i = 0; i < _this.eventHandlers.length; i++) {
                try {
                    if (_this.eventHandlers[i].event == NavigationEvent.OnComponentPushed)
                        _this.eventHandlers[i].action(curComponent);
                }
                catch (e) {
                }
            }
            _this.pushing = undefined;
            if (animation && callback) {
                callback();
            }
        };
        if (animation) {
            Component.setBodyDisabled(true);
            if (preComponent && preComponent.animationOnNavigation) {
                this.moveComponent(preComponent, "0%", "-20%", false, null);
            }
            this.moveComponent(curComponent, "100%", "0%", false, animationEndFunc);
            //this.moveComponentTogether(curComponent, 100, 0,
            //    preComponent.animationOnNavigation ? preComponent : null, 0, -20,
            //    animationEndFunc);
        }
        else {
            animationEndFunc();
        }
    };
    /**
     * 隐藏最后一个组件
     * @param animation
     * @param callback 动画完成后的回调方法
     */
    Navigation.prototype.pop = function (animation, callback) {
        var _this = this;
        if (animation === void 0) { animation = true; }
        if (callback === void 0) { callback = null; }
        if (this.queue.length === 0)
            return;
        var component = this.queue[this.queue.length - 1];
        for (var i = 0; i < this.eventHandlers.length; i++) {
            try {
                if (this.eventHandlers[i].event == NavigationEvent.OnBeforePop) {
                    var handled = this.eventHandlers[i].action(component);
                    if (handled === true) {
                        return;
                    }
                }
            }
            catch (e) {
            }
        }
        component = this.queue.pop();
        if (component.animationOnNavigation == false) {
            animation = false;
        }
        component.onNavigationUnActived(true);
        component.onBeforeNavigationPoped();
        var preComponent = null;
        if (this.queue.length > 0) {
            preComponent = this.queue[this.queue.length - 1];
        }
        var animationEndFunc = function () {
            _this.unload(component);
            Component.setBodyDisabled(false);
            try {
                component.onNavigationPoped();
            }
            catch (e) {
            }
            if (preComponent) {
                try {
                    preComponent.onNavigationActived(true);
                }
                catch (e) {
                }
            }
            for (var i = 0; i < _this.eventHandlers.length; i++) {
                try {
                    if (_this.eventHandlers[i].event == NavigationEvent.OnComponentPoped)
                        _this.eventHandlers[i].action(component);
                }
                catch (e) {
                }
            }
            component.owner = undefined;
            component.dispose();
            if (animation && callback) {
                callback();
            }
        };
        if (!animation) {
            animationEndFunc();
        }
        else {
            Component.setBodyDisabled(true);
            if (preComponent && preComponent.animationOnNavigation) {
                this.moveComponent(preComponent, "-20%", "0%", false, null);
            }
            this.moveComponent(component, "0%", "100%", false, animationEndFunc);
            //this.moveComponentTogether(component, 0, 100,
            //    preComponent.animationOnNavigation ? preComponent : null, -20, 0,
            //    animationEndFunc);
        }
    };
    /**
     * unload指定component
     * @param component
     */
    Navigation.prototype.unloadComponent = function (component) {
        if (this.queue.length === 0)
            return;
        if (this.queue[this.queue.length - 1] === component) {
            this.pop(false);
            return;
        }
        for (var i = 0; i < this.eventHandlers.length; i++) {
            try {
                if (this.eventHandlers[i].event == NavigationEvent.OnBeforePop) {
                    var handled = this.eventHandlers[i].action(component);
                    if (handled === true) {
                        return;
                    }
                }
            }
            catch (e) {
            }
        }
        var animation = false;
        component.onNavigationUnActived(true);
        component.onBeforeNavigationPoped();
        this.unload(component);
        try {
            component.onNavigationPoped();
        }
        catch (e) {
        }
        for (var i = 0; i < this.eventHandlers.length; i++) {
            try {
                if (this.eventHandlers[i].event == NavigationEvent.OnComponentPoped)
                    this.eventHandlers[i].action(component);
            }
            catch (e) {
            }
        }
        component.owner = undefined;
        component.dispose();
    };
    Navigation.keyindex = 1;
    Navigation.keyframNames = {
        "100%to0%": "",
        "0%to100%": "",
        "-20%to0%": "",
        "0%to-20%": ""
    };
    return Navigation;
}(Component));
export { Navigation };
//# sourceMappingURL=Navigation.js.map