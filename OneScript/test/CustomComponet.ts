
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./customComponet.html");

export class CustomComponet extends Component {
    vm: Vue;
    model = {
        tabIndex: 0,
        data2: {
            name:"Jack"
        }
    };

    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

       
    }

    test() {
       
    }
}