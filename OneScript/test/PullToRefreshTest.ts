
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
import { PullToRefresh } from "../PullToRefresh";
var html = require("./pullToRefreshTest.html");

export class PullToRefreshTest extends Component {
    vm: Vue;
    model = {
    };

    constructor() {
        super(html);

        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

        PullToRefresh.enable({
            element: this.element.querySelector("#div1"),
            callback: () => {
                alert("refresh");
            }
        });
    }
}