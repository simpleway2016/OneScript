export function registerVerifyPattern() {
    if ((<any>window)._configPatternHandlered)
        return;
    //防止js被两次引用
    (<any>window)._configPatternHandlered = true;

    function oninput(e) {
        var inputEle = e.target;

        var val = inputEle.value;
        if (val) {
            var pattern = inputEle.getAttribute("jpattern");
            if (pattern) {
                pattern = eval("/" + pattern + "/");
                if (pattern) {
                    var arr = pattern.exec(val);
                    if (Array.isArray(arr))
                        arr = arr[0];
                    if (val !== arr) {
                        inputEle.value = arr;
                        var theEvent = document.createEvent('Event');
                        theEvent.initEvent('input', true, true);
                        e.target.dispatchEvent(theEvent);
                    }
                }
            }
        }
       
    }

    function PatternHandler(element) {
        if (element._patternInited)
            return;
        element._patternInited = true;

        var pattern = element.getAttribute("jpattern");
        if (pattern) {
            element.addEventListener("input", oninput);
        }
    }



    function initFunc() {
        var func = function (container) {
            if (container != document && !container.getAttribute)
                return;
            if (container != document && container.nodeType == 3)//3表示#text类型，不是htmlElement
                return;

            if (container.tagName == "INPUT") {
                PatternHandler(container);
                return;
            }

            var eles = container.querySelectorAll("*[jpattern]");
            for (var i = 0; i < eles.length; i++) {
                PatternHandler(eles[i]);
            }
        }

        if (!(<any>window)._patternHandlerInited) {
            (<any>window)._patternHandlerInited = true;
            //监视document.body子元素变动事件，新加入的element，如果定义touchmode，则自动PatternHandler(element)
            var MutationObserver = (<any>window).MutationObserver ||
                (<any>window).WebKitMutationObserver ||
                (<any>window).MozMutationObserver;

            var mutationObserverSupport = !!MutationObserver;
            if (mutationObserverSupport) {
                try {
                    var options = {
                        'childList': true,
                        subtree: true,
                    };
                    var callback = function (records) {//MutationRecord
                        records.map(function (record) {
                            for (var i = 0; i < record.addedNodes.length; i++) {
                                if (!record.addedNodes[i]._patternInited) {
                                    func(record.addedNodes[i]);
                                }
                            }
                        });
                    };

                    var observer = new MutationObserver(callback);
                    observer.observe(document.body, options);

                }
                catch (e) {
                    //alert(e.message);
                }
            }
            else {
                //throw "浏览器不支持MutationObserver";

                var nodeAddedCallback = function (e) {
                    func(e.target);
                }
                document.body.addEventListener("DOMNodeInserted", nodeAddedCallback, false);
            }
        }

        func(document);

    }


    initFunc();
}