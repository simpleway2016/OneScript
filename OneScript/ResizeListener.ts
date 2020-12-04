export class ResizeListener {
    private elements: HTMLElement[] = [];
    private resizeObserver: any;
    private _disposed = false;
    onResize: (element: HTMLElement[]) => void;

    constructor() {
        if ((<any>window).ResizeObserver) {
            this.resizeObserver = new (<any>window).ResizeObserver((entries: any[]) => {
                var arr = [];
                for (var item of entries) {
                    arr.push(item.target);
                }

                if (this.onResize && arr.length > 0) {
                    try {
                        this.onResize(arr);
                    } catch (e) {

                    }
                }
            });
        }
        else {
            var action = () => {
                if (this._disposed)
                    return;

                var arr = [];
                for (var i = 0; i < this.elements.length; i++) {
                    var ele = this.elements[i];
                    var size = (<any>ele)._$sizInfo;
                    if (ele.offsetWidth != size.w || ele.offsetHeight != size.h) {
                        arr.push(ele);
                        size.w = ele.offsetWidth;
                        size.h = ele.offsetHeight;
                    }
                }

                if (this.onResize && arr.length > 0) {
                    try {
                        this.onResize(arr);
                    } catch (e) {

                    }
                }                   

                window.requestAnimationFrame(action);
            };

            window.requestAnimationFrame(action);
        }
    }

    /**
     * 监听指定element
     * @param element
     */
    listenElement(element: HTMLElement) {
        this.elements.push(element);
        (<any>element)._$sizInfo = {
            w: element.offsetWidth,
            h: element.offsetHeight
        };

        if (this.resizeObserver)
            this.resizeObserver.observe(element);
    }

    /**
     * 不再监听指定element
     * @param element
     */
    unListenElement(element: HTMLElement) {
        var index = this.elements.indexOf(element);
        if (index >= 0) {
            this.elements.splice(index, 1);
            delete (<any>element)._$sizInfo;

            if (this.resizeObserver)
                this.resizeObserver.unobserve(element);
        }
    }

    /**停止所有监听 */
    dispose() {
        this._disposed = true;
        this.elements.forEach(item => {
            delete (<any>item)._$sizInfo;
            if (this.resizeObserver)
                this.resizeObserver.unobserve(item);
        });
    }
}