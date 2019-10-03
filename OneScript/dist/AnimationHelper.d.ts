export declare class AnimationHelper {
    private static flag;
    /**
     * 移动元素
     * @param ele
     * @param timeAndMode 如 0.3s ease-out 或者  0.7s linear
     * @param fromX 从什么位置开始（这是ele的相对位置表示），如 100px 或者 10%
     * @param toX 在什么位置结束（这是ele的相对位置表示），如 500px 或者 100%
     * @param fromY
     * @param toY
     * @param keepValue 动画结束后，是否保持位置
     * @param completedCallBack
     */
    static moveElement(ele: HTMLElement, timeAndMode: string, fromX: string, toX: string, fromY: string, toY: string, fromScale: any, toScale: any, keepValue: boolean, completedCallBack: () => void): void;
}
