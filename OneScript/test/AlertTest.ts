﻿
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./alertTest.html");

export class AlertTest extends Component {
    vm: Vue;
    model = {
        myname: "from AlertTest",
        show: false,
        time:123,
        buttons: [
            {
                text: "确定",
                bold: true,
                click: () => {
                    this.dispose();
                }
            },
            {
                text: "取消"
            }
        ],
        buttonClick: () => {
            console.log("buttonClick raise");
        }
    };

    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
            watch: {
                time: (newvalue) => {
                    console.log("time changed,newvalue:" + newvalue);
                }
            },
        });

    }
}