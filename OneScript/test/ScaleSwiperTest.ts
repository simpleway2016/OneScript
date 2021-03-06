﻿
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./scaleSwiperTest.html");

export class ScaleSwiperTest extends Component {
    vm: Vue;
    model = {
        tabIndex: 0,
        autoplay:true,
        list: [
            {
                name:"abc1"
            }
        ],
        colors: ['#cccccc', '#b03232','#3162ae']
    };

    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

        this.model.list = [
            {
                name: "abc2"
            }
        ];
    }
    clickfunc(text) {
        alert(text);
    }
    additem() {
        this.model.list.splice(1,0,{
            name: "newitem" + (this.model.list.length + 1)
        });
    }
    onchange(index) {
        console.log("index changed:" + index);
    }
}