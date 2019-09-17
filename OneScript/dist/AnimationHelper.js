var AnimationHelper = /** @class */ (function () {
    function AnimationHelper() {
    }
    /**
     * 移动元素
     * @param ele
     * @param timeAndMode 如 0.3s ease-out 或者  0.7s linear
     * @param fromX
     * @param toX
     * @param fromY
     * @param toY
     * @param keepValue 动画结束后，是否保持位置
     * @param completedCallBack
     */
    AnimationHelper.moveElement = function (ele, timeAndMode, fromX, toX, fromY, toY, fromScale, toScale, keepValue, completedCallBack) {
        //创建样式
        var keyname = "_AnimationHelper" + (AnimationHelper.flag++) + "_" + new Date().getTime();
        var keyframeStyle = document.createElement("STYLE");
        var fromStr = "";
        if (fromX != undefined && fromX != null) {
            fromStr = "transform: translate3d(" + fromX + ", " + fromY + ",0)";
        }
        if (fromScale != undefined && fromScale != null) {
            if (fromStr.length == 0)
                fromStr = "transform:";
            fromStr += " scale(" + fromScale + ")";
        }
        if (fromStr.length > 0)
            fromStr = "from {" + fromStr + "}";
        keyframeStyle.innerHTML = "@keyframes " + keyname + " {" + fromStr + " to{transform: translate3d(" + toX + ", " + toY + ",0) scale(" + toScale + ");}}\r\n" +
            "@-webkit-keyframes " + keyname + " {" + fromStr + " to{-webkit-transform: translate3d(" + toX + ", " + toY + ",0) scale(" + toScale + ");}}\r\n";
        document.head.appendChild(keyframeStyle);
        ele.style.transform = "translate3d(" + fromX + "," + fromY + ",0)";
        ele.style.webkitTransform = "translate3d(" + fromX + "," + fromY + ",0)";
        var funcEnd = function () {
            if (keepValue) {
                ele.style.transform = "translate3d(" + toX + "," + toY + ",0) scale(" + toScale + ")";
                ele.style.webkitTransform = "translate3d(" + toX + "," + toY + ",0) scale(" + toScale + ")";
            }
            else {
                ele.style.transform = "";
                ele.style.webkitTransform = "";
            }
            ele.style.animation = "";
            ele.style.webkitAnimation = "";
            ele.removeEventListener("webkitAnimationEnd", funcEnd);
            ele.removeEventListener("animationend", funcEnd);
            document.head.removeChild(keyframeStyle);
            if (completedCallBack)
                completedCallBack();
        };
        // Chrome, Safari 和 Opera 代码
        ele.addEventListener("webkitAnimationEnd", funcEnd);
        // 标准语法
        ele.addEventListener("animationend", funcEnd);
        ele.style.animation = keyname + " " + timeAndMode;
        ele.style.webkitAnimation = keyname + " " + timeAndMode;
        ele.style.animationFillMode = "forwards"; //这两句代码必须放在animation赋值的后面
        ele.style.webkitAnimationFillMode = "forwards";
    };
    AnimationHelper.flag = 0;
    return AnimationHelper;
}());
export { AnimationHelper };
//# sourceMappingURL=AnimationHelper.js.map