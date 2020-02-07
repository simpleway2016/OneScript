import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";
import { AlertTest } from "./AlertTest";

VueComponents.useInputJPattern();
VueComponents.useTouchClick();
VueComponents.useSelector({
    optionclass:"myoption"
});
VueComponents.useLoading({
    color:"#006600"
});
VueComponents.useAlertWindow({
    titleclass: "alert-title",
});

var page = new SelectorTest();
page.setParent(document.body.querySelector("#main"));