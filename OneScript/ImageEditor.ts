import Hammer from "./hammer.min.js"
export enum ImageEditorMaskStyle {
    Rect = 1,
    Circle = 2
}
export interface ImageEditorOption {
    container: HTMLElement;
    style: ImageEditorMaskStyle;
    /**占面积比例，如：50 */
    percent;
    /**输出图像的width */
    outputWidthPixel: number;
}
export class ImageEditor {
    container: HTMLElement;
    private divEle: HTMLElement;
    private canvas: HTMLCanvasElement;
    private image: HTMLImageElement;

    private printScale = 1;
    private canvasWidth = 0;
    private offset = { x: 0, y: 0 };
    private scale = 1;
    private hammer: Hammer;
    constructor(option: ImageEditorOption) {
        this.container = option.container;

        this.divEle = <HTMLElement>document.createElement("DIV");
        this.divEle.style.position = "relative";
        this.divEle.style.width = "100%";
        this.divEle.style.height = "100%";
        this.container.appendChild(this.divEle);

        this.divEle.innerHTML = `<svg style="width:100%;height:100%;position:absolute;left:0;top:0;display:none;" viewBox="0 0 1000 1000">
            <defs>
                <mask id="onescript-imageeditor-mask">
                    <rect x="0" y="0" width="1000" height="1000" fill="#ffffff"></rect>
                    <ellipse id="mask_ellipse" cx="500" cy="500" rx="500" ry="500" fill="#000000"></ellipse>
                    <rect id="mask_rect" x="0" y="0" width="1000" height="1000" fill="#000000"></rect>
                </mask>
            </defs>
            <rect x="0" y="0" width="1000" height="1000" fill="rgba(0,0,0,0.3)" mask="url(#onescript-imageeditor-mask)"></rect>
        </svg>`;

        this.canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.divEle.appendChild(this.canvas);


        this.hammer = new Hammer(this.divEle);
        this.hammer.get('pan').set({
            direction: Hammer.DIRECTION_ALL
        });
        this.hammer.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });
        this.hammer.get('pinch').set({ enable: true });

        var pinchend_time = 0;
        this.hammer.on('pan panstart pinch pinch pinchstart pinchend', (ev) => {
            if (!this.image)
                return;

            switch (ev.type) {
                case "pan":
                    if (!pinchend_time || new Date().getTime() - pinchend_time > 500) {
                        pinchend_time = 0;
                        this.onPan(ev);
                    }                   
                    break;
                case "panstart":
                case "pinchstart":
                    this.onPanstart(ev);
                    break;
                case "pinch":
                    if (!pinchend_time || new Date().getTime() - pinchend_time > 500) {
                        pinchend_time = 0;
                        this.onPinch(ev);
                    }
                    break;
                case "pinchend":
                    pinchend_time = new Date().getTime();
                    break;
            }
        });

        this.setMaskStyle(option.style, option.percent, option.outputWidthPixel);
    }

    private outputWidthPixel = 0;
    /**
     * 设置掩盖样式
     * @param style
     * @param percent 占面积比例，如：50
     * @param outputWidthPixel 输出图像的width
     */
    private setMaskStyle(style: ImageEditorMaskStyle, percent,outputWidthPixel : number) {

        this.outputWidthPixel = outputWidthPixel;
        this.canvasWidth = outputWidthPixel / (percent / 100);

        var svgEle = <HTMLElement>this.divEle.children[0];
        svgEle.style.display = "";
        var mask_ellipse = <SVGEllipseElement>svgEle.querySelector("#mask_ellipse");
        if (style != ImageEditorMaskStyle.Circle)
            mask_ellipse.style.display = "none";
        else {
            mask_ellipse.setAttribute("rx", <any>(500 * percent / 100));
            mask_ellipse.setAttribute("ry", <any>(500 * percent / 100));
        }

        var mask_rect = <SVGEllipseElement>svgEle.querySelector("#mask_rect");
        if (style != ImageEditorMaskStyle.Rect)
            mask_rect.style.display = "none";
        else {
            mask_rect.setAttribute("width", <any>(1000 * percent / 100));
            mask_rect.setAttribute("height", <any>(1000 * percent / 100));
            mask_rect.setAttribute("x", <any>((1000 - 1000 * percent / 100)/2));
            mask_rect.setAttribute("y", <any>((1000 - 1000 * percent / 100) / 2));
        }
    }

    getOutputImage():string {
        var canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        canvas.style.width = this.outputWidthPixel + "px";
        canvas.style.height = this.outputWidthPixel + "px";
        canvas.width = this.outputWidthPixel;
        canvas.height = this.outputWidthPixel;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.canvas, (this.canvas.width - this.outputWidthPixel) / 2, (this.canvas.height - this.outputWidthPixel) / 2, this.outputWidthPixel, this.outputWidthPixel,
            0, 0, this.outputWidthPixel, this.outputWidthPixel);
        return canvas.toDataURL('image/png');
    }

    private _originalOffset = {
        x: 0, y: 0, scale: 1,
        center: { x: 0, y: 0,srcx:0,srcy:0 }
    };
    private onPanstart(ev) {
        this._originalOffset.x = this.offset.x;
        this._originalOffset.y = this.offset.y;
        this._originalOffset.scale = this.scale;
        this._originalOffset.center = ev.center;

        //记录中心点对应的图片的实际坐标
        this._originalOffset.center.srcx = (this._originalOffset.center.x - this._originalOffset.x) / this._originalOffset.scale;
        this._originalOffset.center.srcy = (this._originalOffset.center.y - this._originalOffset.y) / this._originalOffset.scale;
        //console.log(JSON.stringify(ev));
        console.log(JSON.stringify(this._originalOffset));
    }

    private onPan(ev) {
        this.offset.x = this._originalOffset.x + ev.deltaX;
        this.offset.y = this._originalOffset.y + ev.deltaY;

        this.print();
    }
    private onPinch(ev) {
        this.scale = this._originalOffset.scale * ev.scale;

        this.offset.x = this._originalOffset.center.x - this._originalOffset.center.srcx * this.scale;
        this.offset.y = this._originalOffset.center.y - this._originalOffset.center.srcy * this.scale;
     
        this.print();
    }
    async loadImage(input: HTMLInputElement): Promise<void> {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = (e) => {
                this.scale = 0;
                this.offset = { x: 0, y: 0 };
                this.image = new Image();
                this.image.onload = () => {
                    try {
                        this.print();
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                   
                }
                this.image.src = <string>reader.result;

            };
            reader.readAsDataURL(input.files[0]);
        });
    }

    private print() {
        if (!this.image)
            return;

        this.printScale = this.canvasWidth / this.canvas.offsetWidth;

        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvas.offsetHeight * this.printScale;

        if (this.scale <= 0) {
            this.scale = Math.max(this.canvas.offsetWidth / this.image.width, this.canvas.offsetHeight / this.image.height);
        }

        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.scale(this.printScale, this.printScale);
        try {
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height,
                this.offset.x, this.offset.y, this.image.width * this.scale, this.image.height * this.scale);

        } catch (e) {
            throw e;
        }
        finally {
            ctx.resetTransform();
        }
        
    }

    dispose() {
        this.container.removeChild(this.divEle);
    }
}