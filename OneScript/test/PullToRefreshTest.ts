
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
import { PullToRefresh } from "../PullToRefresh";
var html = require("./pullToRefreshTest.html");

export class PullToRefreshTest extends Component {
    vm: Vue;
    model = {
        userInfo: {
            otehr:2
        }
    };

    constructor() {
        super(html);

        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue()
        });

        PullToRefresh.enable({
            element: this.element.querySelector("#div1"),
            callback: () => {
                alert("你要刷新了");
            }
        });
    }

    test() {
        if (this.model.userInfo["name"] == undefined)
            this.vm.$set(this.model.userInfo, "name", "hello");
        else
            alert(this.model.userInfo["name"]);
    }
}