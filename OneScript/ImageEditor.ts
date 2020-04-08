import Hammer from "./hammer.min.js"
export class ImageEditor {
    container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private image: HTMLImageElement;
    /**图片清晰度，越大越清晰，默认是2，表示2倍 */
    printScale = 2;

    private offset = { x: 0, y: 0 };
    private scale = 1;
    private hammer: Hammer;
    constructor(container: HTMLElement) {
        this.container = container;
        this.canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.container.appendChild(this.canvas);
        this.hammer = new Hammer(this.canvas);
        this.hammer.get('pan').set({
            direction: Hammer.DIRECTION_ALL
        });
        this.hammer.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });
        this.hammer.get('pinch').set({ enable: true });

        this.hammer.on('pan panstart pinch pinch pinchstart', (ev) => {
            switch (ev.type) {
                case "pan":
                    this.onPan(ev);
                    break;
                case "panstart":
                case "pinchstart":
                    this.onPanstart(ev);
                    break;
                case "pinch":
                    this.onPinch(ev);
                    break;
            }
        });
    }

    private _originalOffset = { x: 0, y: 0,scale:1 };
    private onPanstart(ev) {
        this._originalOffset.x = this.offset.x;
        this._originalOffset.y = this.offset.y;
        this._originalOffset.scale = this.scale;
    }

    private onPan(ev) {
        this.offset.x = this._originalOffset.x + ev.deltaX;
        this.offset.y = this._originalOffset.y + ev.deltaY;

        this.print();
    }
    private onPinch(ev) {
        this.offset.x = this._originalOffset.x * ev.scale;
        this.offset.y = this._originalOffset.y * ev.scale;

        this.scale = this._originalOffset.scale * ev.scale;
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
        this.canvas.width = this.canvas.offsetWidth * this.printScale;
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
        this.container.removeChild(this.canvas);
    }
}