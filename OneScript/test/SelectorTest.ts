
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./selectorTest.html");

export class SelectorTest extends Component {
    vm: Vue;
    model = {
        options: [],
        selectedText: undefined,
        selectedValue: undefined,
    };

    constructor() {
        super(html);

        for (var i = 0; i < 30; i++) {
            this.model.options.push({
                text: "Option " + (i + 1),
                value: i + 1,
            });
        }

      

        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
            watch: {
                selectedValue: (newvalue) => {

                    this.model.selectedText = this.model.options.find(m => m.value == newvalue).text;

                }
            },
        });
    }
}