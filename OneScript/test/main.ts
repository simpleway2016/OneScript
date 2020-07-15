import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";
import { AlertTest } from "./AlertTest";
import { ImageEditorTest } from "./ImageEditorTest";
import { CustomComponet } from "./CustomComponet";
import { CustomComponet2 } from "./CustomComponet2";
import { Component } from "../Component";

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
if ((<any>window).api)
    (<any>window).api.removeLaunchView();

Component.registerForVue(CustomComponet2, "pTest");

var page = new CustomComponet();
page.setParent(document.body.querySelector("#main"));