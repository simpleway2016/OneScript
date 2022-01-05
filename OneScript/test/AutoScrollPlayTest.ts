
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
var html = require("./autoScrollPlayTest.html");

export class AutoScrollPlayTest extends Component {
    vm: Vue;
    model = {
        list: ["发我艾俄军方", "awofjeowi"],
        play:true,
    };

    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

       
    }

    reset() {
        this.model.list = [new Date().toLocaleTimeString(), "new item1", "new item2"];
    }
    stop() {
        this.model.play = !this.model.play;
    }
    goback() {
        this.dispose();
    }
}