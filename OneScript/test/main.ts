import Vue from "vue";
import { VueComponents } from "../VueComponents";
import { registerSelector } from "../VueComponents/Selector";
import { SelectorTest } from "./SelectorTest";

VueComponents.useSelector();
VueComponents.useLoading();

var page = new SelectorTest();
page.setParent(document.body.querySelector("#main"));