
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./customComponet2_1.html");

export class CustomComponet2_1 extends Component {
    vm: Vue;
    model = {};

    constructor() {
        super(html);

        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

    }

    onNavigationActived(isResume) {
        super.onNavigationActived(isResume);
        console.log("CustomComponet2_1 onNavigationActived");
    }

    onNavigationUnActived(isPop) {
        super.onNavigationUnActived(isPop);
        console.log("CustomComponet2_1 onNavigationUnActived");
    }
}