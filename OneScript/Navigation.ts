import { Component } from "./Component";
import { resolve } from "url";

export class NavigationEvent {
    /**返回true，则停止push*/
    static OnBeforePush = 3;
/**返回true，则停止pop*/
    static OnBeforePop = 4;
    static OnComponentPushed = 1;
    static OnComponentPoped = 2;
}

class NavigationEventHandler {
    event: NavigationEvent;
    action: (component: Component) => any;
    /**是否只是执行一次*/
    onlyOnce: boolean;
}
export class Navigation extends Component {
    /**目前显示的队列*/
    queue: Component[] = [];

    private pushing: Component;
    private static keyindex: number = 1;
    private eventHandlers: NavigationEventHandler[] = [];

    private static keyframNames = {
        "100%to0%": "",
        "0%to100%": "",
        "-20%to0%": "",
        "0%to-20%": ""
    };

    constructor() {
        super("");
        this.position = "absolute";
        this.element.style.width = "100%";
        this.element.style.height = "100%";
        this.element.style.position = "relative";

        Navigation.initAnimationKeyframe();
    }


    /**
     * 触发一个事件
     * @param eventType
     */
    rasieEvent(eventType: NavigationEvent, component: Component) {
        for (var i = 0; i < this.eventHandlers.length; i++) {
            try {
                var item = this.eventHandlers[i];
                if (item.event == eventType) {
                    if (item.onlyOnce) {
                        this.eventHandlers.splice(i, 1);
                        i--;
                    }
                    item.action(component);
                }
            }
            catch (e) {

            }
        }
    }

    /**
     * 注册事件监听
     * @param eventType
     * @param func
     * @param onlyOnce 监听器是否只是触发一次
     */
    addEventListener(eventType: NavigationEvent, func: (component: Component) => any , onlyOnce = false): void {

        var handler = new NavigationEventHandler();
        handler.event = eventType;
        handler.action = func;
        handler.onlyOnce = onlyOnce;

        this.eventHandlers.push(handler);
    }
    removeEventListener(eventType: NavigationEvent, func: (component: Component) => any): void {
        var ret = this.eventHandlers.filter(item => item.event === eventType && item.action === func);

        for (var i = 0; i < ret.length; i++) {
            var index = this.eventHandlers.indexOf(ret[i]);
            this.eventHandlers.splice(index, 1);
        }
    }

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
    private preload(component: Component): void {
      
        component.element.style.position = "absolute";
        component.element.style.left = "0px";
        component.element.style.top = "0px";
        component.element.style.width = "100%";
        component.element.style.height = "100%";
        component.setParent(this.element);
    }

    /**
     * 卸载组件
     * @param component 可以是组件实例或者组件的类型
     */
    private unload(component: Component): void {

        try {
            this.element.removeChild((<Component>component).element);
        }
        catch (e) {

        }

        var index = this.queue.indexOf(<Component>component);
        if (index < 0)
            return;

        this.queue.splice(index, 1);
    }

    private moveComponentTogether(c1: Component, start1: number, end1: number, c2: Component, start2: number, end2: number, callback: () => void) {
        var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        var flag1 = Math.abs(parseInt(<any>((start1 - end1) / (60 * 0.25))));
        var flag2 = Math.abs(parseInt(<any>((start2 - end2) / (60 * 0.25))));
        if (flag1 == 0)
            flag1 = 1;
        if (flag2 == 0)
            flag2 = 1;

        var action = (time: any) => {
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
            c1.element.style.transform = `translate3d(${start1}%,0,0)`;

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
                c2.element.style.transform = `translate3d(${start2}%,0,0)`;
            }

            if (start1 != end1)
                animationFrame(action);
            else {
                if(c2)
                    c2.element.style.transform = `translate3d(0%,0,0)`;
                if (callback)
                    callback();
            }
        };
        animationFrame(action);
    }

    /**加入动画的keyframes到head */
    private static initAnimationKeyframe() {

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
    }

    private moveComponent(component: Component, from: string, to: string, keepValue: boolean, callback: () => void) {

        component.element.style.transform = "translate3d("+from+",0px,0)";
        component.element.style.webkitTransform = "translate3d(" + from + ",0px,0)";

        var keyname = Navigation.keyframNames[from + "to" + to];

        

        var funcEnd = () => {
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
        component.element.style.animationFillMode = "forwards";//这两句代码必须放在animation赋值的后面
        component.element.style.webkitAnimationFillMode = "forwards";
    }

    /**
     * 把component提到最前面显示
     * @param component
     */
    bringToFront(component: Component) {
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
    }

    /**
     * 显示组件，组件pop后，异步完成。
     * @param component
     * @param animation 是否有动画过渡
     * @param callback 动画完成后的回调方法
     */
    async push(curComponent: Component, animation: boolean = true, callback: () => void = null): Promise<void> {
        //需要设置zIndex，否则，如果另一个Component里面的子元素有更高zIndex，则会覆盖这个curComponent
        curComponent.element.style.zIndex = "1";
        curComponent.element.style.position = "absolute";
        curComponent.element.style.left = "0px";
        curComponent.element.style.top = "0px";
        curComponent.element.style.width = "100%";
        curComponent.element.style.height = "100%";

        if (this.pushing) {
            if (this.pushing.constructor == curComponent.constructor)//禁止同一个component被连续push
                return;

            window.setTimeout(() => {
                this.push(curComponent, animation, callback);
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

        

        var preComponent: Component = null;
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

        var animationEndFunc = () => {
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
            

            for (var i = 0; i < this.eventHandlers.length; i++) {
                try {
                    if (this.eventHandlers[i].event == NavigationEvent.OnComponentPushed)
                        this.eventHandlers[i].action(curComponent);
                }
                catch (e) {

                }
            }

            this.pushing = undefined;

            if (animation && callback) {
                callback();
            }
        };

        if (animation) {
            Component.setBodyDisabled(true);
            if (preComponent && preComponent.animationOnNavigation) {
                this.moveComponent(preComponent, "0%", "-20%", false,null);  
            }
            
            this.moveComponent(curComponent, "100%", "0%", false,  animationEndFunc);  

            //this.moveComponentTogether(curComponent, 100, 0,
            //    preComponent.animationOnNavigation ? preComponent : null, 0, -20,
            //    animationEndFunc);
        }
        else {

            animationEndFunc();
        }      

        return new Promise((resolve) => {
            (<any>curComponent)._onDisposed2 = () => {
                resolve();
            };
        });
       
    }

    /**
     * 隐藏最后一个组件
     * @param animation
     * @param callback 动画完成后的回调方法
     */
    pop(animation: boolean = true , callback:()=>void = null): void {
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

        var preComponent: Component = null;
        if (this.queue.length > 0) {
            preComponent = this.queue[this.queue.length - 1];
        }

        var animationEndFunc = () => {
            this.unload(component);
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
    }


    /**
     * unload指定component
     * @param component
     */
    unloadComponent(component: Component): void {
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
    }
}