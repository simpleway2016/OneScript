import { registerSelector, SelectorOption } from "./VueComponents/Selector"
import { registerLoading, LoadingOption } from "./VueComponents/Loading";
import { registerAlertWindow, AlertWindowOption } from "./VueComponents/AlertWindow";
import { registerTouchClick } from "./TouchClickHandler";
import { registerVerifyPattern } from "./VerifyPattern";

export class VueComponents {

    private static addedStyleToBody = false;
    private static addStyleToBody() {
        if (VueComponents.addedStyleToBody)
            return;

        VueComponents.addedStyleToBody = true;
        var style = `
.OneScript .flex-shrink-0 {
    flex-shrink: 0;
}
.OneScript .flex-shrink-1 {
    flex-shrink: 1;
}

.OneScript .display-flex {
    display: box; /* OLD - Android 4.4- */
    display: -webkit-box; /* OLD - iOS 6-, Safari 3.1-6 */
    display: -moz-box; /* OLD - Firefox 19- (buggy but mostly works) */
    display: -ms-flexbox; /* TWEENER - IE 10 */
    display: -webkit-flex; /* NEW - Chrome */
    display: flex; /* NEW, Spec - Opera 12.1, Firefox 20+ */
}

.OneScript .flex-direction-row {
    -webkit-box-orient: horizontal;
    -webkit-flex-direction: row;
    -moz-flex-direction: row;
    -ms-flex-direction: row;
    -o-flex-direction: row;
    flex-direction: row;
}

.OneScript .flex-direction-column {
    -webkit-box-orient: vertical;
    -webkit-flex-direction: column;
    -moz-flex-direction: column;
    -ms-flex-direction: column;
    -o-flex-direction: column;
    flex-direction: column;
}

.OneScript .flex-1 {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
}
.OneScript .flex-0-5 {
    -webkit-box-flex: 0.5;
    -webkit-flex: 0.5;
    flex: 0.5;
}
.OneScript .flex-0-25 {
    -webkit-box-flex: 0.25;
    -webkit-flex: 0.25;
    flex: 0.25;
}
.OneScript .justify-content-center {

    -webkit-box-pack: center;

    -webkit-justify-content: center;
    -moz-justify-content: center;
    -ms-justify-content: center;
    -o-justify-content: center;
    justify-content: center;
}
.OneScript .justify-content-space-between {
    -webkit-box-pack: space-between;
    -webkit-justify-content: space-between;
    -moz-justify-content: space-between;
    -ms-justify-content: space-between;
    -o-justify-content: space-between;
    justify-content: space-between;
}
.OneScript .justify-content-end {
    -webkit-box-pack: end;
    -webkit-justify-content: flex-end;
    -moz-justify-content: flex-end;
    -ms-justify-content: flex-end;
    -o-justify-content: flex-end;
    justify-content: flex-end;
}
.OneScript .align-items-center {
    -webkit-box-align: center;
    -webkit-align-items: center;
    -moz-align-items: center;
    -ms-align-items: center;
    -o-align-items: center;
    align-items: center;
}

.OneScript .align-items-end {
    -webkit-box-align: end;
    -webkit-align-items: flex-end;
    align-items: flex-end;
}
.OneScript .align-items-start {
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    align-items: flex-start;
}
`;
        var styleEle = document.createElement("STYLE");
        styleEle.innerHTML = style;
        document.head.appendChild(styleEle);
    }

    /**
     * 开启input元素的数据验证
     * 例子：
     * <input jpattern="([0-9]|\.){1,6}">  表示只能输入6位以下的数字
     * */
    static useInputJPattern() {
        registerVerifyPattern();
    }

    /**
     * 开启touch触发click事件的支持
     * 只要元素使用了标签属性touchmode，就开启这个功能 如：<div touchmode> 或者 <div touchmode='ontouchclass'> ，表示touch down时，样式ontouchclass生效，touch up时，ontouchclass样式消失
     * vue 绑定长按功能:v-on:longtouch="alert(2)"
     * */
    static useTouchClick() {
        registerTouchClick();
    }

    /**
 * 组件属性：
 * color : 颜色，默认 #f1b748
 * bgcolor : 背景色，默认 #fff
 * coloropacity: 颜色透明度，默认0.9
 * bgcoloropacity: 颜色透明度，默认0.5
 * @param option
     * @param tagname html标签名字，默认<loading>
     */
    static useLoading(option: LoadingOption = {}, tagname: string = "loading") {
        VueComponents.addStyleToBody();
        registerLoading(option,tagname);
    }
   

    /**
     * 组件属性：
     * 样式内容需加入!important标识，如： color:#ccc !important;
     * 
     * canceltext 取消文本
     * selectedclass 
     * cancelclass
     * maskcolor 遮盖层颜色，默认rgba(0,0,0,0.4)
     * title 标题
     * titleclass 标题的样式
     * optionclass 选项的样式
     * show-option-on-init 初始化后，是否直接弹出显示框，默认false
     * oncancel 取消时的回调
     * @param option
     * @param tagname html标签名字，默认<selector>
     */
    static useSelector(option: SelectorOption = {}, tagname: string = "selector") {
        VueComponents.addStyleToBody();
        registerSelector(tagname, option);
    }

    /**
     * 组件属性:
     * 样式内容需加入!important标识，如： color:#ccc !important;
     * 
     * boxclass 主显示框的样式     
     * titleclass 标题文字的样式
     * buttonclick 所有按钮点击后的触发事件，函数原型： function(button) {}
     * buttonclass 按钮样式
     * contentclass 内容的样式
     * buttons 对象数组，对象属性包括：{ text: "", textClass: "" , bold:true , click: function(){  }  }
     * 
     * 例子：
     * <alert-window v-model="show" :buttons="buttons">
            <template>
                你的弹出框内容
            </template>
        </alert-window>
     * @param option
     * @param tagname html标签名字，默认<alert-window>
     */
    static useAlertWindow(option: AlertWindowOption = {} , tagname: string = "alert-window") {
        VueComponents.addStyleToBody();
        registerAlertWindow(tagname, option);
    }
}