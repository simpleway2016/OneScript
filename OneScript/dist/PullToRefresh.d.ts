export interface PullToRefreshOption {
    /**需要进行下拉刷新的元素 */
    element: HTMLElement;
    /**触发刷新时回调 */
    callback: () => void;
    /**自定义显示的图标元素，默认为空则采用框架自带图标 */
    imgEleOrUrl?: HTMLElement | string;
    /**自定义显示的图标元素（达到刷新点时刻），默认为空则采用框架自带图标 */
    imgEleOrUrlWhenEnable?: HTMLElement | string;
    /**自定义显示的图标元素是否随着下拉旋转 */
    rotate?: boolean;
}
export declare class PullToRefresh {
    static addStyle: boolean;
    /**
     * 启用下拉刷新
     * @param option
     */
    static enable(option: PullToRefreshOption): void;
}
