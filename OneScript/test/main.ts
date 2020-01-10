import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";
import { AlertTest } from "./AlertTest";

VueComponents.useSelector();
VueComponents.useLoading();
VueComponents.useAlertWindow();

var page = new AlertTest();
page.setParent(document.body.querySelector("#main"));