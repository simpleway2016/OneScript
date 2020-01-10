export declare class VueComponents {
    /**
 * 注册loading组件，组件属性：
 * color : 颜色，默认 #f1b748
 * bgcolor : 背景色，默认 #fff
 * coloropacity: 颜色透明度，默认0.9
 * bgcoloropacity: 颜色透明度，默认0.5
     * @param tagname html标签名字，默认<selector>
     */
    static useLoading(tagname?: string): void;
    /**
     * 组件属性：
     * options 对象数组，对象属性包括： { text:"" , value : "" }
     * canceltext 取消文本
     * selectedtextcolor 选中的项的文字颜色
     * bgcolor 底色
     * title 标题
     * titleclass 标题文字的样式
     * optionclass 选项的样式
     * border-radius 圆角大小，默认10px
     * margin 与屏幕的间距,默认10px
     * @param tagname html标签名字，默认<loading>
     */
    static useSelector(tagname?: string): void;
}
