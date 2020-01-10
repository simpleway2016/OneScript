
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./alertTest.html");

export class AlertTest extends Component {
    vm: Vue;
    model = {
        myname: "from AlertTest",
        show:false,
        buttons: [
            {
                text: "确定",
                bold: true,
                click: () => {
                    alert(2);
                }
            },
            {
                text: "取消"
            }
        ],
    };

    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
            watch: {
            },
        });
    }
}