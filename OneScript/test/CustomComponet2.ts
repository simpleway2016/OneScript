
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./customComponet2.html");

export class CustomComponet2 extends Component {
    vm: Vue;
    model = {};

    constructor(data) {
        super(html);
        this.model = data;

        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

    }
}