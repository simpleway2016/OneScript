﻿import { StyleParser } from "./StyleParser";
import { IHttpClientUsing } from "./IHttpClientUsing";
import Vue from "vue";
import { Navigation } from "./Navigation";




export class Component implements IHttpClientUsing {
    
    
    /**根元素
     * 注意：不要把此元素绑定到Vue上，Vue绑定应使用getViewModelElement()获取元素
     * */
    element: HTMLElement;
    owner: Navigation;
    onDisposed: () => void;
    /**页面的position
     */
    position = "";
    /**样式表id名字 */
    private static StyleFlag = 0;

    /**导航时，是否支持动画 */
    get animationOnNavigation(): boolean {
        return true;
    }

    get visible(): boolean {
        if (!this.element)
            return false;

        //return this.element.style.visibility !== "hidden";
        return this.element.style.display !== "none";
    }
    set visible(value: boolean) {
        if (!this.element)
            return;

        //if (value) {
        //    this.element.style.visibility = "";
        //}
        //else {
        //    this.element.style.display = "none";
        //    this.element.style.visibility = "hidden";
        //    this.element.style.display = "";
        //}

         if (value) {
             this.element.style.display = "";
        }
        else {
            this.element.style.display = "none";
        }
    }

    private _actived = false;
    get actived(): boolean {
        return this._actived;
    }

    private $_vmobj;
    private get $vmObj(): Vue {
        if (!this.$_vmobj) {
            for (var p in this)
            {
                if (p == "$vmObj" || p == "$_vmobj")
                    continue;

                var obj: any = this[p];
                try {
                    if (obj && obj.$destroy && obj.$children) {
                        this.$_vmobj = obj;
                        break;
                    }
                } catch (e) {

                }
            }
        }
        return this.$_vmobj;
    }

    private _disposed = false;
    get disposed(): boolean {
        return this._disposed;
    }
    /**
     * 
     * @param html view的html内容
     */
    constructor(html: string = undefined) {
        this.element = document.createElement("DIV");
        this.element.style.width = "100%";
        this.element.style.height = "100%";

       
        if (html) {
            this.element.innerHTML = Component.requireHtml(html, this);

            var container = this.getViewModelElement();
            container.style.width = "100%";
            container.style.height = "100%";
        }
    }

    private usingHttpClients: XMLHttpRequest[] = [];
    usingHttp(http: XMLHttpRequest):void {
        this.usingHttpClients.push(http);
    }
    freeHttp(http: XMLHttpRequest):void {
        var index = this.usingHttpClients.indexOf(http);
        if (index >= 0)
            this.usingHttpClients.splice(index, 1);
    }
    
    /**
     * 把<head>里面的style添加到当前document.head，然后返回html文件<body>里面的内容
     * @param html
     */
    static requireHtml(html: string, component: Component): string {

        var bodytag = /\<body[^\<]*\>/.exec(html);
        if (!bodytag) {
            return "<div>" + html + "</div>";
        }
        else {
            var headerTag = /\<head[^\<]*\>/.exec(html);
            var endHeaderTagIndex = html.lastIndexOf("</head>");
            var headHtml = html.substr(headerTag.index + headerTag[0].length, endHeaderTagIndex - headerTag.index - headerTag[0].length);
            var tempEle = document.createElement("DIV");
            tempEle.innerHTML = headHtml;
            var styleEles = tempEle.querySelectorAll("STYLE");

            var elementClassName : any;
            if (styleEles.length > 0) {

                if (!(<any>component).constructor._onescriptClassName) {
                    (<any>component).constructor._onescriptClassName = elementClassName = "_OSC" + Component.StyleFlag++;

                    for (var i = 0; i < styleEles.length; i++) {
                        var styleEle = styleEles[i];
                        var styleitems = StyleParser.parse(styleEle.textContent);
                        var text = "";
                        styleitems.forEach((item) => {
                            if (item.name.indexOf("@") !== 0) {
                                item.name = "." + elementClassName + " " + item.name;
                            }
                            text += item.toString((<any>window).$currentRoot);
                        });
                        styleEle.textContent = text;
                        document.head.appendChild(styleEle);
                    }
                }
                else {
                    elementClassName = (<any>component).constructor._onescriptClassName;
                }
            }

            var endBodyTagIndex = html.lastIndexOf("</body>");
            var bodyStr = html.substr(bodytag.index + bodytag[0].length, endBodyTagIndex - bodytag.index - bodytag[0].length);

            if (elementClassName) {
                return "<div class=\"" + elementClassName + "\">" + bodyStr + "</div>";
            }
            else {
                return "<div>" + bodyStr + "</div>";
            }
        }
    }

    /**
     * 为模块类型注册html标签，如注册标签为<p-test>，那么可以这样用<p-test :data="mydata" :active="showed"></p-test>，mydata可以是一个对象，传到component的构造函数的第一个参数
     * :active="showed" 表示把showed变量绑定到组件的active属性处，当showed=true时，会让此Component触发onNavigationActived事件，当showed=false时，会触发onNavigationUnActived事件，
     * @param componentType 模块的类型
     * @param tagName 注册的html标签名称，默认为componentType的小写
     */
    static registerForVue(componentType: any, tagName: string): void {

        Vue.component(tagName, {
            template: "<div v-bind:_data='data'></div>",
            //props: ["data", "src","active"],
            props: {
                active: {
                    type: Boolean,
                    default: true
                },
                data: {},
                src: {}
            },
            mounted: function () {
                var obj = new componentType(this.data);
                obj.setParent(this.$el);
                this.$OneScriptComponent = obj;

                console.debug("loaded " + componentType.name);

                if (this.active) {
                    (<Component>this.$OneScriptComponent).onNavigationActived(undefined);
                }
                else
                    (<Component>this.$OneScriptComponent).onNavigationUnActived(undefined);

                
            },
            methods: {
                onActiveChange: function (newVal) {
                    if (newVal) {
                        if ((<Component>this.$OneScriptComponent).actived == false)
                            (<Component>this.$OneScriptComponent).onNavigationActived(undefined);
                    }
                    else if ((<Component>this.$OneScriptComponent).actived)
                        (<Component>this.$OneScriptComponent).onNavigationUnActived(undefined);
                }
            },
            watch: {
                active: function (newVal) {
                    this.onActiveChange(newVal);
                }
            },
            destroyed: function () {
                console.debug("destroyed " + componentType.name);
                if (this.$OneScriptComponent) {
                    if ((<Component>this.$OneScriptComponent).actived)
                        (<Component>this.$OneScriptComponent).onNavigationUnActived(undefined);
                    this.$OneScriptComponent.dispose();
                    this.$OneScriptComponent = null;
                }
            },
            updated: function () {
                if (this.$OneScriptComponent) {
                    this.$OneScriptComponent.dispose();
                    this.$OneScriptComponent = null;
                }
                this.$el.innerHTML = "";

                var obj = new componentType(this.data);
                obj.setParent(this.$el);
                this.$OneScriptComponent = obj;
                console.debug("loaded " + componentType.name + " on updated");
            },
        });
    }

    private static _maskDiv: HTMLElement;
    /**设置document.body disabled ，防止用户双击连续pushed同一个component*/
    static setBodyDisabled(disabed: boolean) {
        if (!Component._maskDiv) {
            Component._maskDiv = document.createElement("DIV");
            Component._maskDiv.style.position = "fixed";
            Component._maskDiv.style.left = "0px";
            Component._maskDiv.style.top = "0px";
            Component._maskDiv.style.width = window.innerWidth + "px";
            Component._maskDiv.style.height = window.innerHeight + "px";
            Component._maskDiv.style.zIndex = "999999";
        }
        try {
            if (disabed)
                document.body.appendChild(Component._maskDiv);
            else
                document.body.removeChild(Component._maskDiv);
        }
        catch (e) { }
    }
    

    /**创建一个Vue的methods对象，使vue的methods和this的方法关联起来 */
    getMethodObjectForVue(): any {
        var methodObj = {};
        var self = this;
        for (var p in this) {
            if (typeof this[p] === "function") {
                eval(`methodObj.${p}=function () { return self.${p}.apply(self, arguments);}`);
            }
        }
        return methodObj;
    }

    /**销毁Component，如果某个属性具有$destroy方法，也会被同时调用 */
    dispose(): void {
        this._actived = false;
        this._disposed = true;
        this.abortHttps();

        try {
            if (this.owner) {
                this.onNavigationUnActived(true);
                this.onBeforeNavigationPoped();

                var index = this.owner.queue.indexOf(this);
                if (index >= 0) {
                    this.owner.queue.splice(index, 1);
                    if (index >= this.owner.queue.length && this.owner.queue.length > 0) {
                        var lastitem = this.owner.queue[this.owner.queue.length - 1];
                        lastitem.onNavigationActived(true);
                    }
                }
            }
        } catch (e) {

        }
        finally {
            this.owner = null;
        }

        try {
            if (this.element.parentElement)
                this.element.parentElement.removeChild(this.element);
        }
        catch (e) { }


        if (this.$vmObj) {
            try {
                console.log(`执行vue.$destroy()`);
                this.$vmObj.$destroy();
            } catch (e) {

            }            
        }

        console.log((<any>this.constructor).name + " dispose");

        if (this.onDisposed) {
            this.onDisposed();
        }

        if ((<any>this)._onDisposed2) {
            (<any>this)._onDisposed2();
        }
    }

    /**
     * 获取ViewModel（如：Vue）绑定的el
     * */
    getViewModelElement(): HTMLElement {
        return <HTMLElement>this.element.children[0];
    }

    /**
     * 设置element的parentElement
     */
    setParent(parentEle: Element | string): void {
        if (parentEle) {

            if (typeof parentEle === "string")
                parentEle = <any>document.body.querySelector(parentEle);

            //为了兼容android 5.0 flex布局，这里做些处理
            var position = (<HTMLElement>parentEle).style.position;
            var myposition = this.position;

            if (!myposition) {
                if (parentEle == document.body) {
                    myposition = "fixed";
                }
                else if (position === "relative" || position === "absolute" || position === "fixed") {
                    myposition = "absolute";
                }
            }

            if (myposition) {
                this.element.style.position = myposition;
                this.element.style.left = "0px";
                this.element.style.top = "0px";
            }

            (<HTMLElement>parentEle).appendChild(this.element);
            this.onViewReady();
        }       
    }


    /**在外部调用setParent后，内部会调用此方法 */
    onViewReady() {

    }

    /**Navigation push完成后，调用此方法 */
    onNavigationPushed() {
        if (this.$vmObj) {
            try {
                this.$vmObj.$children.forEach(m => {
                    let child = <Component>((<any>m).$OneScriptComponent);
                    if (!child)
                        return;

                    child.onNavigationPushed();
                });
            } catch (e) {

            }

        }
    }

    /**取消所有与其关联的http请求 */
    abortHttps() {
        if (!this.usingHttpClients || this.usingHttpClients.length === 0)
            return;

        this.usingHttpClients.forEach((http) => {
            //取消所有http请求
            try {
                (<any>http)._aborted = true;
                http.abort();
            }
            catch (e) {

            }
        });
        this.usingHttpClients = [];
    }

    onBeforeNavigationPoped() {
        this.abortHttps();

        if (this.$vmObj) {
            try {
                this.$vmObj.$children.forEach(m => {
                    let child = <Component>((<any>m).$OneScriptComponent);
                    if (!child)
                        return;
                    child.onBeforeNavigationPoped();
                });
            } catch (e) {

            }

        }
    }

    /**Navigation pop（或者unload）完成后，调用此方法 */
    onNavigationPoped() {
        if (this.$vmObj) {
            try {
                this.$vmObj.$children.forEach(m => {
                    let child = <Component>((<any>m).$OneScriptComponent);
                    if (!child)
                        return;

                    child.onNavigationPoped();
                });
            } catch (e) {

            }
            
        }
    }

    /**
     * 当前Component位于Navigation的最上面时触发
     * @param isResume 是否是上面窗口pop后，回到当前页面的
     */
    onNavigationActived(isResume:boolean) {
        this._actived = true;

        if (this.$vmObj) {
            try {
                this.$vmObj.$children.forEach(m => {
                    let child = <Component>((<any>m).$OneScriptComponent);
                    if (!child)
                        return;

                    if ((<any>m).active && !child.actived) {
                        child.onNavigationActived(isResume);
                    }
                });
            } catch (e) {

            }
        }
    }

    /**
     * 当前Component不位于Navigation的最上面时触发
     * @param isPoping 是否是当前component被pop引发的onNavigationUnActived
     */
    onNavigationUnActived(isPoping: boolean) {
        this._actived = false;

        if (this.$vmObj) {
            try {
                this.$vmObj.$children.forEach(m => {
                    let child = <Component>((<any>m).$OneScriptComponent);
                    if (!child)
                        return;

                    if (child.actived) {
                        child.onNavigationUnActived(isPoping);
                    }
                });
            } catch (e) {

            }
        }
    }
}