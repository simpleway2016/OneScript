import Hammer from "./hammer.min.js"
export enum ImageEditorMaskStyle {
    Rect = 1,
    Circle = 2
}
export interface ImageEditorOption {
    container: HTMLElement;
    /**截图框的形状 */
    style: ImageEditorMaskStyle;
    /**截图框的宽占容器宽度的比例，如：50 */
    percent;
    /**输出图像的width */
    outputWidthPixel: number;
    /**输出图像的height */
    outputHeightPixel: number;
    /**支持旋转，默认true */
    supportRotate?: boolean;
}
enum ControlEvent {
    None = 0,
    Pinch = 1,
    Rotate = 2
}
export class ImageEditor {
    container: HTMLElement;
    private divEle: HTMLElement;
    private canvas: HTMLCanvasElement;
    private image: HTMLImageElement;

    private controlingEvent = ControlEvent.None;
    private angle = 0;
    private printScale = 1;
    private canvasWidth = 0;
    private canvasHeight = 0;
    private offset = { x: 0, y: 0 };
    private scale = 1;
    private hammer: Hammer;
    constructor(option: ImageEditorOption) {
        if (typeof option.supportRotate == "undefined") {
            option.supportRotate = true;
        }
        this.container = option.container;

        this.setMaskStyle(option);
    }

    private option: ImageEditorOption;

    private setMaskStyle(option: ImageEditorOption) {
        if (this.container.offsetWidth == 0 || this.container.offsetHeight == 0) {
            window.requestAnimationFrame(() => {
                this.setMaskStyle(option);
            });
            return;
        }
        this.option = option;

        var height = 1000 * this.container.offsetHeight / this.container.offsetWidth;
        this.divEle = <HTMLElement>document.createElement("DIV");
        this.divEle.style.position = "relative";
        this.divEle.style.width = "100%";
        this.divEle.style.height = "100%";
        this.container.appendChild(this.divEle);

        this.divEle.innerHTML = `<svg style="width:100%;height:100%;position:absolute;left:0;top:0;display:none;" viewBox="0 0 1000 ${height}">
            <defs>
                <mask id="onescript-imageeditor-mask">
                    <rect x="0" y="0" width="1000" height="${height}" fill="#ffffff"></rect>
                    <ellipse id="mask_ellipse" cx="500" cy="${height/2}" rx="500" ry="500" fill="#000000"></ellipse>
                    <rect id="mask_rect" x="0" y="0" width="1000" height="1000" fill="#000000"></rect>
                </mask>
            </defs>
            <rect x="0" y="0" width="1000" height="${height}" fill="rgba(0,0,0,0.3)" mask="url(#onescript-imageeditor-mask)"></rect>
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

        if (this.option.supportRotate)
            this.hammer.get('rotate').set({ enable: true });

        var pinchend_time = 0;
        //rotatestart rotatemove rotateend rotatecancel
        this.hammer.on('pan panstart pinchmove pinchstart pinchend pinchcancel rotatestart rotatemove rotateend rotatecancel', (ev) => {
            if (!this.image)
                return;

            switch (ev.type) {
                case "pan":
                    if (!pinchend_time || new Date().getTime() - pinchend_time > 100) {
                        pinchend_time = 0;
                        this.onPan(ev);
                    }
                    break;
                case "panstart":
                case "pinchstart":
                    this.onPanstart(ev);
                    break;
                case "pinchmove":
                    if (this.controlingEvent == ControlEvent.None || this.controlingEvent == ControlEvent.Pinch) {
                        if (!pinchend_time || new Date().getTime() - pinchend_time > 100) {
                            pinchend_time = 0;
                            this.onPinch(ev);
                        }
                    }                   
                    break;
                case "pinchend":
                case "pinchcancel":
                    pinchend_time = new Date().getTime();
                    if (this.controlingEvent == ControlEvent.Pinch) {
                        this.controlingEvent = ControlEvent.None;
                    }
                    break;
                case "rotatestart":
                    this.onRotateStart(ev);
                    break;
                case "rotatemove":
                    if (this.controlingEvent == ControlEvent.None || this.controlingEvent == ControlEvent.Rotate) {
                        this.onRotateMove(ev);
                    }                    
                    break;
                case "rotateend":
                case "rotatecancel":
                    pinchend_time = new Date().getTime();
                    if (this.controlingEvent == ControlEvent.Rotate) {
                        this.controlingEvent = ControlEvent.None;
                    }
                    this.onRotateEnd(ev);
                    break;
            }
        });
        
        
        this.canvasWidth = option.outputWidthPixel / (option.percent / 100);
        this.canvasHeight = this.canvasWidth * (this.container.offsetHeight / this.container.offsetWidth);

        var svgEle = <HTMLElement>this.divEle.children[0];
        svgEle.style.display = "";
        var mask_ellipse = <SVGEllipseElement>svgEle.querySelector("#mask_ellipse");
        if (option.style != ImageEditorMaskStyle.Circle)
            mask_ellipse.style.display = "none";
        else {
            var rx = 500 * option.percent / 100;
            mask_ellipse.setAttribute("rx", <any>rx);

            var ry = rx * this.option.outputHeightPixel / this.option.outputWidthPixel;
            mask_ellipse.setAttribute("ry", <any>ry);
        }

        var mask_rect = <SVGEllipseElement>svgEle.querySelector("#mask_rect");
        if (option.style != ImageEditorMaskStyle.Rect)
            mask_rect.style.display = "none";
        else {
            var w = 1000 * option.percent / 100;
            var h = w * this.option.outputHeightPixel / this.option.outputWidthPixel;
            mask_rect.setAttribute("width", <any>w);
            mask_rect.setAttribute("height", <any>h);
            mask_rect.setAttribute("x", <any>((1000 - w) / 2));
            mask_rect.setAttribute("y", <any>((height - h) / 2));
        }
    }

    private static dataURLtoBlob(dataurl): Blob {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    /**
     * 压缩图片
     * @param file
     * @param targetWidth 压缩后分辨率
     */
    static async compressImage(file: File, targetWidth:number): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            try {
                var reader = new FileReader();

                reader.onload = (e) => {

                    var image = new Image();
                    image.onload = function () {
                        if (image.width <= targetWidth) {
                            resolve(file);
                            return;
                        }
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        var imageWidth = targetWidth;
                        var imageHeight = image.height * targetWidth / image.width;

                        canvas.width = imageWidth
                        canvas.height = imageHeight

                        context.drawImage(image, 0, 0, imageWidth, imageHeight);

                        //使用toDataURL将canvas上的图片转换为base64格式
                        var data = canvas.toDataURL('image/jpeg');
                        var ret : any = ImageEditor.dataURLtoBlob(data);
                        resolve(ret);
                    };
                    (<any>image).src = e.target.result;
                };
                reader.readAsDataURL(file);
            } catch (e) {
                reject(e);
            }
        });
    }

    getOutputBlob(): Blob {
        var base64 = this.getOutputBase64();
        return ImageEditor.dataURLtoBlob(base64);
    }

    getOutputBase64():string {
        var canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        canvas.style.width = this.option.outputWidthPixel + "px";
        canvas.style.height = this.option.outputHeightPixel + "px";
        canvas.width = this.option.outputWidthPixel;
        canvas.height = this.option.outputHeightPixel;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.canvas, (this.canvas.width - this.option.outputWidthPixel) / 2, (this.canvas.height - this.option.outputHeightPixel) / 2, this.option.outputWidthPixel, this.option.outputHeightPixel,
            0, 0, this.option.outputWidthPixel, this.option.outputHeightPixel);
        return canvas.toDataURL('image/png');
    }

    private _originalOffset = {
        x: 0, y: 0, scale: 1,rotation:0,
        center: { x: 0, y: 0,srcx:0,srcy:0 }
    };
    private _originalRotate = {
        x: 0, y: 0, scale: 1, rotation: 0,angle:0,
        center: { x: 0, y: 0, srcx: 0, srcy: 0 }
    };
    private onRotateStart(ev) {
        this._originalRotate.rotation = ev.rotation;
        this._originalRotate.center = ev.center;
        this._originalRotate.scale = this.scale;
        this._originalRotate.angle = this.angle;
        this._originalRotate.x = this.offset.x;
        this._originalRotate.y = this.offset.y;

        //记录中心点对应的图片的实际坐标
        this._originalRotate.center.srcx = (this._originalRotate.center.x - this.offset.x) / this._originalRotate.scale;
        this._originalRotate.center.srcy = (this._originalRotate.center.y - this.offset.y) / this._originalRotate.scale;

        //alert(JSON.stringify(this._originalOffset.center) + "\r\n" + this._originalOffset.center.y + "," + this.offset.y + "\r\n"
        //    + this.image.width + "," + this.image.height);
    }
    private onRotateMove(ev) {
        var angle = ev.rotation - this._originalRotate.rotation;
        if (this.controlingEvent == ControlEvent.None) {
            if (Math.abs(angle) >= 5) {

                this.controlingEvent = ControlEvent.Rotate;
            }
            else {
                return;
            }
        }

        this.angle = this._originalRotate.angle + angle;
        
        this.print();
    }
    private onRotateEnd(ev) {

    }

    /**
     * 获取旋转后坐标
     * @param rx
     * @param ry
     * @param dx
     * @param dy
     * @param angle 顺时针角度
     */
    private rotationTransform(rx, ry, dx, dy, angle) {
        var point = this.vRotationTransform(dx - rx, dy - ry, angle);
        return { x: point.x + rx, y: point.y + ry }; 
    }
    vRotationTransform(dX, dY, dAngle) {
        //变为逆时针角度
        dAngle = -dAngle * Math.PI / 180;
        /*假如有一个点(dX,dY).这个点绕原点逆时针旋转角度dAngle(弧度)。运行到新位置的坐标是：
          (iNewX, iNewY)。
          或者等价的说，保持这个点不动，但是新坐标系相对于旧坐标系绕原点顺时针转动dAngle,(dX,dY)在
          新坐标系的坐标是(iNewX, iNewY).*/
        var iNewX = dX * Math.cos(dAngle) - dY * Math.sin(dAngle);
        var iNewY = dX * Math.sin(dAngle) + dY * Math.cos(dAngle);
        return { x: iNewX, y: iNewY };
    }

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
        if (this.controlingEvent == ControlEvent.None && Math.abs(1 - ev.scale) > 0.1) {
            this.controlingEvent = ControlEvent.Pinch;
        }
        this.scale = this._originalOffset.scale * ev.scale;

        this.offset.x = this._originalOffset.center.x - this._originalOffset.center.srcx * this.scale;
        this.offset.y = this._originalOffset.center.y - this._originalOffset.center.srcy * this.scale;
     
        this.print();
    }

    async loadImageByUrl(url: string, scale = undefined, offset = undefined): Promise<void> {
        return new Promise((resolve, reject) => {
            this.offset = { x: 0, y: 0 };
            if (offset != undefined)
                this.offset = offset;

            this.image = new Image();
            this.image.onload = () => {
                try {
                    if (scale == undefined) {
                        this.scale = 0;
                    }
                    else {
                        this.scale = scale;
                    }
                    this.print();
                    resolve();
                } catch (e) {
                    reject(e);
                }

            }
            this.image.src = url;
        });
    }

    async loadImage(input: HTMLInputElement): Promise<void> {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = (e) => {
                this.offset = { x: 0, y: 0 };
                this.image = new Image();
                this.image.onload = () => {
                    try {

                        this.scale = 0;
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

    private async loadImageBySrc(src, callback: () => void = undefined): Promise<void> {
        return new Promise((resolve, reject) => {

            this.offset = { x: 0, y: 0 };
            this.image = new Image();
            this.image.onload = () => {
                try {
                    if (callback)
                        callback();

                    this.scale = 0;
                    this.print();
                    resolve();
                } catch (e) {
                    reject(e);
                }

            }
            this.image.src = src;

        });
    }

    async loadImageByImage(image: HTMLImageElement): Promise<void> {
        return new Promise((resolve, reject) => {

            this.offset = { x: 0, y: 0 };
            this.image = image;

            var action = () => {
                try {

                    this.scale = 0;
                    this.print();
                    resolve();
                } catch (e) {
                    reject(e);
                }

            };

            this.image.onload = action;

            if (this.image.complete) {
                action();
            }

        });
    }

    async loadImageByBlob(blob: Blob): Promise<void> {
        return this.loadImageBySrc(window.URL.createObjectURL(blob), () => {
            window.URL.revokeObjectURL(this.image.src); // 清除释放
        });
    }

    async loadImageByBase64(base64: string): Promise<void> {
        return this.loadImageBySrc(base64);
    }

    private print() {
        if (!this.image)
            return;
        if (!this.canvas) {
            window.requestAnimationFrame(() => {
                this.print();
            });
            return;
        }

        this.printScale = this.canvasWidth / this.canvas.offsetWidth;

        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        if (this.scale <= 0) {
            this.scale = Math.max(this.canvas.offsetWidth / this.image.width, this.canvas.offsetHeight / this.image.height);
        }

        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.scale(this.printScale, this.printScale);

        var centerWidth = this.canvas.width * (this.option.percent / 100);
        var centerX = (this.canvas.width - centerWidth) / 2;
        var maxRight = (centerWidth + centerX) / this.printScale;
        var centerY = (this.canvas.height - centerWidth) / 2;
        var maxBottom = (centerWidth + centerY) / this.printScale;

        if (this.scale * this.image.width < centerWidth / this.printScale)
            this.scale = centerWidth / this.printScale / this.image.width;
        if (this.scale * this.image.height < centerWidth / this.printScale)
            this.scale = centerWidth / this.printScale / this.image.height;

        if (this.offset.x + this.image.width * this.scale < maxRight)
            this.offset.x = maxRight - this.image.width * this.scale;
        else if (this.offset.x > centerX / this.printScale)
            this.offset.x = centerX / this.printScale;

        if (this.offset.y + this.image.height * this.scale < maxBottom)
            this.offset.y = maxBottom - this.image.height * this.scale;
        else if (this.offset.y > centerY / this.printScale)
            this.offset.y = centerY / this.printScale;

        try {
            //ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height,
            //    this.offset.x, this.offset.y, this.image.width * this.scale, this.image.height * this.scale);
            ctx.translate(this.offset.x + this.image.width * this.scale / 2, this.offset.y + this.image.height * this.scale / 2);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height,
                -this.image.width * this.scale / 2, -this.image.height * this.scale / 2, this.image.width * this.scale, this.image.height * this.scale);

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