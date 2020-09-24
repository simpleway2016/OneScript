﻿export function registerTouchClick() {
    if ((<any>window)._configTouchHandlered)
        return;
    //防止js被两次引用
    (<any>window)._configTouchHandlered = true;

    (<any>window).lowAndroidCustomScrolls = [];
    var lastClickEvent = null;
    var lastLongTouchEvent = null;
    var LONGCLICKACTIVETIME = 600;//长按触发时间
    var CLICKACTIVETIME = 300;//click点击有效按下时间
    var androidVersion = 5;
    var touch_event_target = null;

    if (navigator.userAgent) {
        var userAgent = navigator.userAgent;
        var index = userAgent.indexOf("Android")
        if (index >= 0) {
            androidVersion = parseFloat(userAgent.slice(index + 8));
        }
    }

    function simulateClick(el, touch_event_target) {
        var toFocusEle = touch_event_target || el;

        try {
            //先让当前焦点对象失去焦点，因为toFocusEle如果是svg元素，原焦点控件可能不会自动失去焦点
            var focusedEle: HTMLElement = document.body.querySelector(":focus");
            if (toFocusEle !== focusedEle)
                focusedEle.blur();
        }
        catch (e) { }

        toFocusEle.focus();
        //console.debug("simulateClick " + toFocusEle.outerHTML);
        if (document.createEvent) {
            var theEvent = lastClickEvent;//使用上一个event对象，这样，才能让e.stopPropagation()有作用
            if (!theEvent) {
                theEvent = document.createEvent('MouseEvents');
                theEvent.initEvent('click', true, true);
                lastClickEvent = theEvent;
            }
            toFocusEle.dispatchEvent(theEvent);
        } else if (el.fireEvent) {
            el.fireEvent('onclick');
        }
    }

    var addCls = function (el, cls) {
        if ('classList' in el) {
            el.classList.add(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls + ' ' + cls;
            el.className = newCls;
        }
        return el;
    };
    var removeCls = function (el, cls) {
        if ('classList' in el) {
            el.classList.remove(cls);
        } else {
            var allcls = el.className.split(' ');
            var str = "";
            for (var i = 0; i < allcls.length; i++) {
                if (allcls[i] != cls && allcls[i].length > 0) {
                    str += allcls[i] + " ";
                }
            }
            el.className = str;
        }
        return el;
    };

    function setTouchForScroll(element) {
        if (element._setedTouchForScroll || element.style.overflow == "hidden" || element.style.overflowY == "hidden")
            return;
        element._setedTouchForScroll = true;

        var touchPoint;
        element.addEventListener("touchstart", function (e) {
            e.stopPropagation();
            touchPoint = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                scrollTop: element.scrollTop,
            };
        });
        element.addEventListener("touchmove", function (e) {

            if (touchPoint) {
                e.stopPropagation();
                var y = e.touches[0].clientY;
                var scrolltop = touchPoint.y - y + touchPoint.scrollTop;
                if (screenTop < 0)
                    screenTop = 0;
                element.scrollTop = scrolltop;
            }
        });
        element.addEventListener("touchend", function (e) {
            e.stopPropagation();
            touchPoint = null;
        });
    }

    function TouchHandler(element) {
        if (!("ontouchstart" in element))
            return;

        var maxMoveDistance = 0;//Math.min((<any>window).screen.width, (<any>window).screen.height) / 10;

        var modeclass = element.getAttribute("touchmode");
        var modeclassElement = element;
        if (!modeclass || modeclass.length == 0)
            modeclass = null;
        if (modeclass) {
            if (modeclass.indexOf("[") == 0) {
                var expression = modeclass.substr(1, modeclass.indexOf("]") - 1);
                modeclass = modeclass.substr(modeclass.indexOf("]") + 1);
                modeclassElement = eval(expression.replace("{0}", "element"));
            }
        }
        var touchPoint;
        var timeoutflag;


        if (androidVersion < 5 && (<any>window).lowAndroidCustomScrolls.length > 0) {
            //如果android版本小于5，必须禁止它的滚动功能，否则1px的滚动都会导致touchend事件无法触发
            //查找上级element是否需要滚动，然后用touch帮它实现滚动
            var parentEle = element.parentElement;
            while (true) {
                if (!parentEle || parentEle.tagName == "BODY")
                    break;
                var found = false;
                for (var i = 0; i < (<any>window).lowAndroidCustomScrolls.length; i++) {
                    if ((<any>window).lowAndroidCustomScrolls[i] == parentEle) {
                        element._shouldPreventDefaultOnTouchStart = true;
                        setTouchForScroll(parentEle);
                        found = true;
                        break;
                    }
                }
                if (found)
                    break;
                parentEle = parentEle.parentElement;

            }
        }

        //var longTouchAttr = element.getAttribute("onlongtouch");
        //if (longTouchAttr && longTouchAttr.length > 0) {
        //    element.addEventListener("longtouch", function (e) {
        //        eval(longTouchAttr);
        //    }, false);
        //}
        //else {
        //    longTouchAttr = null;
        //}

        var _mybeClick = false;
        element.addEventListener("touchstart", function (e) {
            if (touch_event_target)
                return;

            _mybeClick = true;
            lastClickEvent = null;
            if (e) {
                touch_event_target = e.target;
            }
            if (element._shouldPreventDefaultOnTouchStart) {
                e.preventDefault();
            }
            if (modeclass) {
                addCls(modeclassElement, modeclass);
            }
            touchPoint = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                time: new Date().getTime()
            };


            if (true) {
                timeoutflag = setTimeout(function () {
                    timeoutflag = null;
                    if (touchPoint) {
                        if (modeclass) {
                            removeCls(modeclassElement, modeclass);
                        }
                        touchPoint = null;

                        var theEvent = lastLongTouchEvent;
                        if (!theEvent) {
                            theEvent = document.createEvent('MouseEvents');
                            theEvent.initEvent('longtouch', true, true);
                            lastLongTouchEvent = theEvent;
                        }
                        element.dispatchEvent(theEvent);
                    }
                }, LONGCLICKACTIVETIME);
            }
        });

        element.addEventListener("touchmove", function (e) {
            if (timeoutflag) {
                clearTimeout(timeoutflag);
                timeoutflag = null;
            }

            if (touchPoint) {

                if (modeclass) {
                    removeCls(modeclassElement, modeclass);
                }
                touchPoint = null;
                touch_event_target = null;
                _mybeClick = false;

                //var x = e.touches[0].clientX;
                //var y = e.touches[0].clientY;
                //if (Math.abs(x - touchPoint.x) > maxMoveDistance || Math.abs(y - touchPoint.y) > maxMoveDistance) {
                //    if (modeclass) {
                //        removeCls(modeclassElement, modeclass);
                //    }
                //    touchPoint = null;
                //    touch_event_target = null;
                //    _mybeClick = false;
                //}
            }
        });

        element.addEventListener("touchend", function (e) {
            if (_mybeClick) {
                _mybeClick = false;


                var touchEvtTar = touch_event_target;
                touch_event_target = null;

                if (timeoutflag) {
                    clearTimeout(timeoutflag);
                    timeoutflag = null;
                }
                if (modeclass) {
                    removeCls(modeclassElement, modeclass);
                }

                //用preventDefault有时会在滚动时，报错，最好只在肯定是点击时，才调用preventDefault
                e.stopPropagation();
                e.preventDefault();
                var tp = touchPoint;
                if (tp) {

                    var x = e.changedTouches[0].clientX;
                    var y = e.changedTouches[0].clientY;
                    if (Math.abs(x - tp.x) <= maxMoveDistance && Math.abs(y - tp.y) <= maxMoveDistance) {
                        if ((new Date().getTime() - tp.time) < CLICKACTIVETIME) {
                            setTimeout(function () {
                                simulateClick(element, touchEvtTar);
                            }, 0);
                        }
                    }
                    touchPoint = null;
                }
            }
        });
    }



    function parseTouchHandler() {
        var func = function (container) {
            if (container != document && !container.getAttribute)
                return;
            if (container != document && container.nodeType == 3)//3表示#text类型，不是htmlElement
                return;
            if (container != document && container.getAttribute("touchmode") != null) {
                if (!container._touchModeInited) {
                    container._touchModeInited = true;
                    TouchHandler(container);
                }
            }
            var eles = container.querySelectorAll("*[touchmode]");
            for (var i = 0; i < eles.length; i++) {
                if (!eles[i]._touchModeInited) {
                    eles[i]._touchModeInited = true;
                    TouchHandler(eles[i]);
                }
            }
        }

        if (!(<any>window)._touchHandlerInited) {
            (<any>window)._touchHandlerInited = true;
            //监视document.body子元素变动事件，新加入的element，如果定义touchmode，则自动TouchHandler(element)
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
                                if (!record.addedNodes[i]._touchModeInited) {
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

                var nodeAddedCallback = function(e) {
                    func(e.target);
                }
                document.body.addEventListener("DOMNodeInserted", nodeAddedCallback, false);
            }
        }

        func(document);

    }


    if (document.addEventListener && "ontouchstart" in document.documentElement) {
        parseTouchHandler();
    }
}