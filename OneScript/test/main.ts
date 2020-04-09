import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";
import { AlertTest } from "./AlertTest";
import { ImageEditorTest } from "./ImageEditorTest";

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
var page = new ImageEditorTest();
page.setParent(document.body.querySelector("#main"));