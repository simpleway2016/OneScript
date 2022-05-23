import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";
import { AlertTest } from "./AlertTest";
import { ImageEditorTest } from "./ImageEditorTest";
import { CustomComponet } from "./CustomComponet";
import { CustomComponet2 } from "./CustomComponet2";
import { CustomComponet2_1 } from "./CustomComponet2_1";
import { Component } from "../Component";
import { PullToRefreshTest } from "./PullToRefreshTest";
import { AutoScrollItemListTest } from "./AutoScrollItemListTest";
import { ScaleSwiperTest } from "./ScaleSwiperTest";
import { ViewPagerTest } from "./ViewPagerTest";
import { AutoScrollPlayTest } from "./AutoScrollPlayTest";

VueComponents.useInputJPattern();
VueComponents.useTouchClick();
VueComponents.useSelector({
    optionclass: "myoption",
    selectedclass:"myoptionselected"
});
VueComponents.useLoading({
    bodyclass:"loading"
});
VueComponents.useAlertWindow({
    titleclass: "alert-title",
});
VueComponents.useAutoScrollItemList();
VueComponents.useScaleSwiper();
VueComponents.useViewPager();
VueComponents.useAutoScrollPlay();

if ((<any>window).api)
    (<any>window).api.removeLaunchView();

Component.registerForVue(CustomComponet2, "pTest");
Component.registerForVue(CustomComponet2_1, "pTest2");
var page = new CustomComponet();
page.setParent(document.body.querySelector("#main"));

page.onNavigationActived(false);