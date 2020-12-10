export interface AnimationElementOption {
    ele: HTMLElement;
    timeAndMode: string;
    fromX: string;
    toX: string;
    fromY: string;
    toY: string;
    fromScale: number | number[];
    toScale: number | number[];
    keepValue: boolean;
}
export class AnimationHelper {
    private static flag: number = 0;
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
    static moveElement(ele: HTMLElement, timeAndMode: string, fromX: string, toX: string, fromY: string, toY: string, fromScale, toScale, keepValue: boolean, completedCallBack: () => void) {
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

            if (Array.isArray(fromScale)) {
                fromStr += " scale(" + fromScale[0] + "," + fromScale[1] + ")";
            }
            else {
                fromStr += " scale(" + fromScale + ")";
            }
        }

        if (Array.isArray(fromScale))
            toScale = `${toScale[0]},${toScale[1]}`;

        if (fromStr.length > 0)
            fromStr = "from {" + fromStr + "}";

        keyframeStyle.innerHTML = "@keyframes " + keyname + " {" + fromStr + " to{transform: translate3d(" + toX + ", " + toY + ",0) scale(" + toScale + ");}}\r\n" +
            "@-webkit-keyframes " + keyname + " {" + fromStr + " to{-webkit-transform: translate3d(" + toX + ", " + toY + ",0) scale(" + toScale + ");}}\r\n";
        document.head.appendChild(keyframeStyle);

        ele.style.transform = "translate3d(" + fromX + "," + fromY + ",0)";
        ele.style.webkitTransform = "translate3d(" + fromX + "," + fromY + ",0)";


        var funcEnd = () => {
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
        ele.style.animationFillMode = "forwards";//这两句代码必须放在animation赋值的后面
        ele.style.webkitAnimationFillMode = "forwards";
    }

    static moveElements(options: AnimationElementOption[], completedCallBack: () => void) {
        var doneCount = 0;
        options.forEach(o => {
            AnimationHelper.moveElement(o.ele, o.timeAndMode, o.fromX, o.toX, o.fromY, o.toY, o.fromScale, o.toScale, o.keepValue, () => {
                doneCount++;
                if (doneCount == options.length && completedCallBack) {
                    completedCallBack();
                }
            });
        });
    }
}