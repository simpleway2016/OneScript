import { StyleParser } from "./StyleParser";
import Vue from "vue";
var Component = /** @class */ (function () {
    /**
     *
     * @param html view的html内容
     */
    function Component(html) {
        if (html === void 0) { html = undefined; }
        this._actived = false;
        this.usingHttpClients = [];
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
    Object.defineProperty(Component.prototype, "animationOnNavigation", {
        /**导航时，是否支持动画 */
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "visible", {
        get: function () {
            if (!this.element)
                return false;
            return this.element.style.visibility !== "hidden";
        },
        set: function (value) {
            if (!this.element)
                return;
            if (value) {
                this.element.style.visibility = "";
            }
            else {
                this.element.style.display = "none";
                this.element.style.visibility = "hidden";
                this.element.style.display = "";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "actived", {
        get: function () {
            return this._actived;
        },
        enumerable: true,
        configurable: true
    });
    Component.prototype.usingHttp = function (http) {
        this.usingHttpClients.push(http);
    };
    Component.prototype.freeHttp = function (http) {
        var index = this.usingHttpClients.indexOf(http);
        if (index >= 0)
            this.usingHttpClients.splice(index, 1);
    };
    /**
     * 把<head>里面的style添加到当前document.head，然后返回html文件<body>里面的内容
     * @param html
     */
    Component.requireHtml = function (html, component) {
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
            var elementClassName;
            if (styleEles.length > 0) {
                if (!component.constructor._onescriptClassName) {
                    component.constructor._onescriptClassName = elementClassName = "_OSC" + Component.StyleFlag++;
                    for (var i = 0; i < styleEles.length; i++) {
                        var styleEle = styleEles[i];
                        var styleitems = StyleParser.parse(styleEle.textContent);
                        var text = "";
                        styleitems.forEach(function (item) {
                            if (item.name.indexOf("@") !== 0) {
                                item.name = "." + elementClassName + " " + item.name;
                            }
                            text += item.toString(window.$currentRoot);
                        });
                        styleEle.textContent = text;
                        document.head.appendChild(styleEle);
                    }
                }
                else {
                    elementClassName = component.constructor._onescriptClassName;
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
    };
    /**
     * 为模块类型注册html标签，如注册标签为<p-test>，那么可以这样用<p-test :data="mydata"></p-test>，mydata可以是一个对象，传到component的构造函数的第一个参数
     * @param componentType 模块的类型
     * @param tagName 注册的html标签名称，默认为componentType的小写
     */
    Component.registerForVue = function (componentType, tagName) {
        Vue.component(tagName, {
            template: "<div v-bind:_data='data'></div>",
            props: ["data", "src"],
            mounted: function () {
                var obj = new componentType(this.data);
                obj.setParent(this.$el);
                this._OneScriptComponent = obj;
                console.debug("loaded " + componentType.name);
            },
            destroyed: function () {
                console.debug("destroyed " + componentType.name);
                if (this._OneScriptComponent) {
                    this._OneScriptComponent.dispose();
                    this._OneScriptComponent = null;
                }
            },
            updated: function () {
                if (this._OneScriptComponent) {
                    this._OneScriptComponent.dispose();
                    this._OneScriptComponent = null;
                }
                this.$el.innerHTML = "";
                var obj = new componentType(this.data);
                obj.setParent(this.$el);
                this._OneScriptComponent = obj;
                console.debug("loaded " + componentType.name + " on updated");
            },
        });
    };
    /**设置document.body disabled ，防止用户双击连续pushed同一个component*/
    Component.setBodyDisabled = function (disabed) {
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
    };
    /**创建一个Vue的methods对象，使vue的methods和this的方法关联起来 */
    Component.prototype.getMethodObjectForVue = function () {
        var methodObj = {};
        var self = this;
        for (var p in this) {
            if (typeof this[p] === "function") {
                eval("methodObj." + p + "=function () { return self." + p + ".apply(self, arguments);}");
            }
        }
        return methodObj;
    };
    /**销毁Component，如果某个属性具有$destroy方法，也会被同时调用 */
    Component.prototype.dispose = function () {
        this._actived = false;
        this.abortHttps();
        try {
            if (this.element.parentElement)
                this.element.parentElement.removeChild(this.element);
        }
        catch (e) { }
        for (var p in this) {
            var obj = this[p];
            if (obj && obj.$destroy && typeof obj.$destroy === "function") {
                console.log("\u6267\u884C" + this.constructor.name + "." + p + ".$destroy()");
                obj.$destroy();
            }
        }
        console.debug(this.constructor.name + " dispose");
    };
    /**
     * 获取ViewModel（如：Vue）绑定的el
     * */
    Component.prototype.getViewModelElement = function () {
        return this.element.children[0];
    };
    /**
     * 设置element的parentElement
     */
    Component.prototype.setParent = function (parentEle) {
        parentEle.appendChild(this.element);
        this.onViewReady();
    };
    /**在外部调用setParent后，内部会调用此方法 */
    Component.prototype.onViewReady = function () {
    };
    /**Navigation push完成后，调用此方法 */
    Component.prototype.onNavigationPushed = function () {
    };
    /**取消所有与其关联的http请求 */
    Component.prototype.abortHttps = function () {
        if (!this.usingHttpClients || this.usingHttpClients.length === 0)
            return;
        this.usingHttpClients.forEach(function (http) {
            //取消所有http请求
            try {
                http._aborted = true;
                http.abort();
            }
            catch (e) {
            }
        });
        this.usingHttpClients = [];
    };
    Component.prototype.onBeforeNavigationPoped = function () {
        this.abortHttps();
    };
    /**Navigation pop（或者unload）完成后，调用此方法 */
    Component.prototype.onNavigationPoped = function () {
    };
    /**
     * 当前Component位于Navigation的最上面时触发
     * @param isResume 是否是上面窗口pop后，回到当前页面的
     */
    Component.prototype.onNavigationActived = function (isResume) {
        this._actived = true;
    };
    /**
     * 当前Component不位于Navigation的最上面时触发
     * @param isPoping 是否是当前component被pop引发的onNavigationUnActived
     */
    Component.prototype.onNavigationUnActived = function (isPoping) {
        this._actived = false;
    };
    /**样式表id名字 */
    Component.StyleFlag = 0;
    return Component;
}());
export { Component };
//# sourceMappingURL=Component.js.map