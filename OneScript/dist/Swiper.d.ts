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
export declare class Swiper {
    container: HTMLElement;
    currentIndexChange: (sender: any, index: any) => void;
    option: SwiperOption;
    set currentIndex(value: number);
    get currentIndex(): number;
    private _currentIndex;
    private eleImgWidth;
    private imgDivs;
    private lefts;
    private moveleftFlag;
    private paginationContainer;
    private touchStartAction;
    private touchMoveAction;
    private touchEndAction;
    private timeAction;
    /**
     *
     * @param container swiper显示的容器
     * @param option
     */
    constructor(container: Element | string, option: SwiperOption);
    private setevent;
    private _autoplayTimer;
    private _disposed;
    dispose(): void;
    /**停止自动播放 */
    private _autoPlayInterval;
    stop(): void;
    /**开始自动播放 */
    start(): void;
    private inited;
    private init;
}
