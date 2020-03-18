import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";
import { AlertTest } from "./AlertTest";

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

var page = new AlertTest();
page.setParent(document.body.querySelector("#main"));