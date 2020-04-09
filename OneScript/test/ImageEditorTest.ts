
import Vue from "vue";
import { Component } from "../Component";
import { VueComponents } from "../VueComponents";
import { ImageEditor, ImageEditorMaskStyle } from "../ImageEditor";
var html = require("./ImageEditorTest.html");

export class ImageEditorTest extends Component {
    vm: Vue;
    model = {
        imgsrc:"",
    };
    imageEditor: ImageEditor;
    constructor() {
        super(html);


        this.vm = new Vue({
            el: this.getViewModelElement(),
            data: this.model,
            methods: this.getMethodObjectForVue(),
        });

        this.imageEditor = new ImageEditor({
            container: this.element.querySelector("#div1"),
            style: ImageEditorMaskStyle.Rect,
            percent: 60,
            outputWidthPixel: 100,
            outputHeightPixel: 100
        });
    }

    onselected(e: Event) {
        var input = <HTMLInputElement>e.target;

        this.imageEditor.loadImage(input);
    }

    getImage() {
        this.model.imgsrc = this.imageEditor.getOutputImage();
    }
}