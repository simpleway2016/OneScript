
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
import { ImageEditor } from "../ImageEditor";
var html = require("./ImageEditorTest.html");

export class ImageEditorTest extends Component {
    vm: Vue;
    model = {
        
    };
    imageEditor: ImageEditor;
    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

        this.imageEditor = new ImageEditor(this.element.querySelector("#div1"));
    }

    onselected(e: Event) {
        var input = <HTMLInputElement>e.target;

        this.imageEditor.loadImage(input);
    }
}