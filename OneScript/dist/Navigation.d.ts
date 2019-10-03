import { Component } from "./Component";
export declare class NavigationEvent {
    static OnBeforePush: number;
    static OnBeforePop: number;
    static OnComponentPushed: number;
    static OnComponentPoped: number;
}
export declare class Navigation extends Component {
    /**目前显示的队列*/
    queue: Component[];
    private pushing;
    private static keyindex;
    private eventHandlers;
    private static keyframNames;
    constructor();
    /**
     * 触发一个事件
     * @param eventType
     */
    rasieEvent(eventType: NavigationEvent, component: Component): void;
    addEventListener(eventType: NavigationEvent, func: (component: Component) => any): void;
    removeEventListener(eventType: NavigationEvent, func: (component: Component) => any): void;
    /**
     *
     * @param component
     */
    private preload;
    /**
     * 卸载组件
     * @param component 可以是组件实例或者组件的类型
     */
    private unload;
    private moveComponentTogether;
    /**加入动画的keyframes到head */
    private static initAnimationKeyframe;
    private moveComponent;
    /**
     * 把component提到最前面显示
     * @param component
     */
    bringToFront(component: Component): void;
    /**
     * 显示组件
     * @param component
     * @param animation 是否有动画过渡
     * @param callback 动画完成后的回调方法
     */
    push(curComponent: Component, animation?: boolean, callback?: () => void): void;
    /**
     * 隐藏最后一个组件
     * @param animation
     * @param callback 动画完成后的回调方法
     */
    pop(animation?: boolean, callback?: () => void): void;
    /**
     * unload指定component
     * @param component
     */
    unloadComponent(component: Component): void;
}
