/**
 例子：
     var ctrl = new ScrollSelector({
        element: "#div1",
        showRows: 5,
        bgColor: "#F5F5F5",
        data:[2500,3800,-8966,2112,2323,31221,21212,7878,894646]
    });
    ctrl.onchange = function () {
        console.log(ctrl.selectedIndex);
    }
 * */
class ScrollSelector {
    option: ScrollSelectorOption;
    onchange: (sender: ScrollSelector) => any;
    private _offsetTop: number;
    private _selectedIndex: number = -1;
    get selectedIndex(): number {
        return this._selectedIndex;
    }
    set selectedIndex(value: number) {
        if (this._selectedIndex !== value) {
            this._selectedIndex = value;
            var rowheight = this.option.element.offsetHeight / this.option.showRows;

            this._offsetTop = (this.option.element.offsetHeight / 2) - value * rowheight - rowheight / 2;
            this.draw();
            if (this.onchange) {
                try {
                    this.onchange(this);
                }
                catch (e) {

                }
            }
        }
    }

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(option: ScrollSelectorOption) {
       
        this.option = new ScrollSelectorOption();
        for (var p in option) {
            this.option[p] = option[p];
        }

        if (typeof this.option.element === "string") {
            this.option.element = document.body.querySelector(<string>this.option.element);
        }
        if (!this.option.element)
            throw new Error("element is null");

        if (this.option.showRows % 2 === 0)
            this.option.showRows++;

        this.canvas = <HTMLCanvasElement>document.createElement("CANVAS");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.option.element.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");

        this.selectedIndex = 0;
        this.init();
    }

    dispose() {
        this.canvas.parentElement.removeChild(this.canvas);
    }

    setData(data: any[]) {
        this.option.data = data;
        this._selectedIndex = 0;
        var rowheight = this.option.element.offsetHeight / this.option.showRows;
        this._offsetTop = (this.option.element.offsetHeight / 2) - rowheight / 2;
        this.draw();
    }

    private moveTo(from: number, to: number) {
        var flag = 3;
        if (from > to) {
            flag = -3;
        }
        if (Math.abs(this._offsetTop - to) >= 3) {
            setTimeout(() => {
                this._offsetTop += flag;
                this.draw();
                this.moveTo(from, to);
            }, 10);
        }
        else {
            this._offsetTop = to;
            this.draw();
        }
    }

    private getPixelRatio() {
        var backingStore = (<any>this.ctx).backingStorePixelRatio ||
            (<any>this.ctx).webkitBackingStorePixelRatio ||
            (<any>this.ctx).mozBackingStorePixelRatio ||
            (<any>this.ctx).msBackingStorePixelRatio ||
            (<any>this.ctx).oBackingStorePixelRatio ||
            (<any>this.ctx).backingStorePixelRatio || 1;

        return (window.devicePixelRatio || 1) / backingStore;
    }


    private init() {
        var starty = -1;
        var originalTop;
        var minTop;
        var maxTop;
        var originalSelectedIndex;
        this.canvas.addEventListener("touchstart", (e: TouchEvent) => {
            e.preventDefault();

            originalTop = this._offsetTop;
            starty = e.touches[0].clientY;
            originalSelectedIndex = this._selectedIndex;
            var rowheight = this.canvas.offsetHeight / this.option.showRows;
            maxTop = (this.option.element.offsetHeight / 2) - rowheight / 2;
            minTop = (this.option.element.offsetHeight / 2) - (this.option.data.length - 1) * rowheight - rowheight / 2;
        }, false);
        this.canvas.addEventListener("touchmove", (e: TouchEvent) => {
            if (starty >= 0) {
                var y = e.touches[0].clientY;
                var rowheight = this.canvas.offsetHeight / this.option.showRows;
                this._offsetTop = originalTop + y - starty;
                if (this._offsetTop < minTop)
                    this._offsetTop = minTop;
                else if (this._offsetTop > maxTop)
                    this._offsetTop = maxTop;
                this.draw();
            }
        }, false);
        this.canvas.addEventListener("touchend", (e: TouchEvent) => {
            if (starty >= 0) {
                var y = e.changedTouches[0].clientY;
                var rowheight = this.canvas.offsetHeight / this.option.showRows;
                var offsetTop = originalTop + y - starty;
                if (offsetTop > minTop && offsetTop < maxTop) {
                    this.moveTo(offsetTop, (this.option.element.offsetHeight / 2) - this._selectedIndex * rowheight - rowheight / 2);
                }
                if (originalSelectedIndex != this._selectedIndex) {
                    if (this.onchange) {
                        try {
                            this.onchange(this);
                        }
                        catch (e) {

                        }
                    }
                }
            }
        }, false);
    }

    private draw() {
        var radio = this.getPixelRatio();
        this.canvas.height = this.canvas.offsetHeight * radio;
        this.canvas.width = this.canvas.offsetWidth * radio;

        var rowheight = this.canvas.height / this.option.showRows;
        this.ctx.fillStyle = this.option.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //中心位置，画白色底
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(0, this.canvas.height / 2 - rowheight / 2, this.canvas.width, rowheight);

        //画三角
        this.ctx.fillStyle = this.option.selectedTextColor;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2 - rowheight / 2 + rowheight / 3);
        this.ctx.lineTo(rowheight / 11, this.canvas.height / 2);
        this.ctx.lineTo(0, this.canvas.height / 2 - rowheight / 2 + 2 * rowheight / 3);
        this.ctx.lineTo(0, this.canvas.height / 2 - rowheight / 2 + rowheight / 3);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - 1, this.canvas.height / 2 - rowheight / 2 + rowheight / 3);
        this.ctx.lineTo(this.canvas.width - 1 - rowheight / 11, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width - 1, this.canvas.height / 2 - rowheight / 2 + 2 * rowheight / 3);
        this.ctx.lineTo(this.canvas.width - 1, this.canvas.height / 2 - rowheight / 2 + rowheight / 3);
        this.ctx.closePath();
        this.ctx.fill();

        var y = this._offsetTop * radio;
        this.ctx.textAlign = "center";//x的坐标对应文字水平中点
        this.ctx.textBaseline = 'middle';//y的坐标对应文字垂直中点
        for (var i = 0; i < this.option.data.length; i++) {
            if (y + rowheight / 2 >= this.canvas.height / 2 - rowheight / 2 &&
                y + rowheight / 2 < this.canvas.height / 2 + rowheight / 2) {
                this._selectedIndex = i;
            }

            if (i == this._selectedIndex) {
                this.ctx.font = 0.8 * rowheight / 2 + "px Arial";
                this.ctx.fillStyle = this.option.selectedTextColor;
            }
            else {
                this.ctx.font = 0.75 * (1.1 * rowheight / 2) + "px Arial";
                this.ctx.fillStyle = this.option.textColor;
            }
            this.ctx.fillText(this.option.data[i], this.canvas.width / 2, y + rowheight / 2);
            y += rowheight;
        }
    }
}

class ScrollSelectorOption {
    data: any[];
    element: HTMLElement;
    bgColor: string;
    //画面共允许显示几行数据
    showRows: number;
    selectedTextColor: string = "#18B625";
    textColor: string = "#888888";
}