import { IHttpClientUsing } from "./IHttpClientUsing";
import { Navigation } from "./Navigation";
export declare class Component implements IHttpClientUsing {
    /**根元素
     * 注意：不要把此元素绑定到Vue上，Vue绑定应使用getViewModelElement()获取元素
     * */
    element: HTMLElement;
    owner: Navigation;
    /**样式表id名字 */
    private static StyleFlag;
    /**导航时，是否支持动画 */
    readonly animationOnNavigation: boolean;
    visible: boolean;
    private _actived;
    readonly actived: boolean;
    /**
     *
     * @param html view的html内容
     */
    constructor(html?: string);
    private usingHttpClients;
    usingHttp(http: XMLHttpRequest): void;
    freeHttp(http: XMLHttpRequest): void;
    /**
     * 把<head>里面的style添加到当前document.head，然后返回html文件<body>里面的内容
     * @param html
     */
    static requireHtml(html: string, component: Component): string;
    /**
     * 为模块类型注册html标签，如注册标签为<p-test>，那么可以这样用<p-test :data="mydata"></p-test>，mydata可以是一个对象，传到component的构造函数的第一个参数
     * @param componentType 模块的类型
     * @param tagName 注册的html标签名称，默认为componentType的小写
     */
    static registerForVue(componentType: any, tagName: string): void;
    private static _maskDiv;
    /**设置document.body disabled ，防止用户双击连续pushed同一个component*/
    static setBodyDisabled(disabed: boolean): void;
    /**创建一个Vue的methods对象，使vue的methods和this的方法关联起来 */
    getMethodObjectForVue(): any;
    /**销毁Component，如果某个属性具有$destroy方法，也会被同时调用 */
    dispose(): void;
    /**
     * 获取ViewModel（如：Vue）绑定的el
     * */
    getViewModelElement(): HTMLElement;
    /**
     * 设置element的parentElement
     */
    setParent(parentEle: Element | string): void;
    /**在外部调用setParent后，内部会调用此方法 */
    onViewReady(): void;
    /**Navigation push完成后，调用此方法 */
    onNavigationPushed(): void;
    /**取消所有与其关联的http请求 */
    abortHttps(): void;
    onBeforeNavigationPoped(): void;
    /**Navigation pop（或者unload）完成后，调用此方法 */
    onNavigationPoped(): void;
    /**
     * 当前Component位于Navigation的最上面时触发
     * @param isResume 是否是上面窗口pop后，回到当前页面的
     */
    onNavigationActived(isResume: boolean): void;
    /**
     * 当前Component不位于Navigation的最上面时触发
     * @param isPoping 是否是当前component被pop引发的onNavigationUnActived
     */
    onNavigationUnActived(isPoping: boolean): void;
}
