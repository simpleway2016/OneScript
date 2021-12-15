import { IHttpClientUsing } from "./IHttpClientUsing";

export interface HttpClientOption {
    url: string;
    data?: any;
    header?: any;
    callback?: (ret: any, err: any) => void;
    timeout?: number;
    async?: boolean;
    withCredentials?: boolean;
    /**
     * POST | GET，默认 POST
     * */
    method?: string;
    /**设置当前网络请求所属的component，当component被pop时，会自动abort所有此component关联的网络请求 */
    component?: IHttpClientUsing;
    /**postJson时是否采用二进制，如果为true,data应该为Uint8Array，默认false */
    sendInBlob?: boolean;
}

export class HttpClient {
    static defaultOption: HttpClientOption = {
        timeout: 30000,
        async: true,
        method: "POST",
        url: undefined,
        sendInBlob: false,
        withCredentials:false,
    };
    /**如果返回true，则send会取消*/
    static BeforeSend: (option: HttpClientOption) => boolean;
    static defaultHeaders = {};

    private static createRequest(option: HttpClientOption) {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (http.readyState == 4) {
                if ((<any>http)._timer) {
                    clearTimeout((<any>http)._timer);
                    (<any>http)._timer = undefined;
                }

                if (http.status == 200) {
                    if (option && option.component) {
                        option.component.freeHttp(http);
                    }

                    if (option && option.callback) {
                        var cb = option.callback;
                        option.callback = null;
                        cb(http.responseText, null);
                       
                    }
                }
                else {
                    if (option && option.component) {
                        option.component.freeHttp(http);
                    }
                    if (option && option.callback) {
                        var cb = option.callback;
                        option.callback = null;

                        if ((<any>http)._aborted) {
                            //cb(null, "http aborted");
                        }
                        else {
                            cb(null, { status: http.status, msg: http.responseText});
                        }
                    }
                }
                
            }
        };
        http.onerror = function (e) {
            if ((<any>http)._timer) {
                clearTimeout((<any>http)._timer);
                (<any>http)._timer = undefined;
            }

            if (option && option.component) {
                option.component.freeHttp(http);
            }
            if (option && option.callback) {
                var cb = option.callback;
                option.callback = null;

                var msg = "network error";
                if (e && e.target) {
                    if ((<XMLHttpRequest>e.target).status === 0)
                        msg = "连接未初始化，可能是跨域问题引起的";
                }
                cb(null, msg);
            }
        };
        http.ontimeout = function () {
            if ((<any>http)._timer) {
                clearTimeout((<any>http)._timer);
                (<any>http)._timer = undefined;
            }

            if (option && option.component) {
                option.component.freeHttp(http);
            }
            if (option && option.callback) {
                var cb = option.callback;
                option.callback = null;
                cb(null, "timeout");
            }
        };

        return http;
    }

    private static createDefaultOption(source: HttpClientOption): void {
        var option = HttpClient.defaultOption;

        for (var p in option) {
            if ((<any>source)[p] === undefined) {
                (<any>source)[p] = (<any>option)[p];
            }
        }        
    }

    /**
     * option.data以json方式post到服务器
     * @param option
     */
    static async postJsonAsync(option: HttpClientOption): Promise<string> {
        return new Promise((resolve, reject) => {
            option.callback = (ret, err) => {
                if (err)
                    reject(err);
                else
                    resolve(ret);
            };
            HttpClient.postJson(option);
        });
    }

    /**
     * option.data以json方式post到服务器
     * @param option
     */
    static postJson(option: HttpClientOption): XMLHttpRequest {
        if (!option.header)
            option.header = {};
        option.header["Content-Type"] = "application/json";
        return HttpClient.send(option);
    }

    /**
     * 发送请求到服务器
     * @param option
     */
    static async sendAsync(option: HttpClientOption): Promise<string> {
        return new Promise((resolve, reject) => {
            option.callback = (ret, err) => {
                if (err)
                    reject(err);
                else
                    resolve(ret);
            };
            HttpClient.send(option);
        });
    }

    /**
     * 发送请求到服务器
     * @param option
     */
    static send(option: HttpClientOption): XMLHttpRequest  {
        if (HttpClient.BeforeSend) {
            var ret = HttpClient.BeforeSend(option);
            if (ret === true)
                return null;
        }

        if (!option)
            throw new Error("option is null");
        HttpClient.createDefaultOption(option);
        

        if (!option.header)
            option.header = {};

        
        //if (option.header["Access-Control-Allow-Origin"] === undefined)
        //    option.header["Access-Control-Allow-Origin"] = "*";
        

        try {
            var content = "";
            if (option.data) {
                if (option.header["Content-Type"] === "application/json") {                   

                    if (option.sendInBlob) {
                        //if (typeof option.data === "object") {
                        //    content = <any>new Blob([JSON.stringify(option.data, null, 2)],
                        //        { type: 'application/json' }); // 创建 blob 对象，同时指定类型
                        //}
                            var data: Uint8Array = <Uint8Array>option.data;
                            content = <any>new Blob([data],
                                { type: 'application/json' }); 
                        
                    }
                    else {
                        content = JSON.stringify(option.data);
                    }
                }
                else if (option.method === "POST") {
                    var formData = new FormData();

                    for (var p in option.data) {
                        if (option.data[p] != undefined) {
                            var val = option.data[p];
                            if (Array.isArray(val)) {
                                for (var m = 0; m < val.length; m++) {
                                    formData.append(p, val[m]);
                                }
                            }
                            else {
                                formData.append(p, val);
                            }
                        }
                    }
                    content = <any>formData;
                }
                else {
                    for (var p in option.data) {
                        if (option.data[p] != undefined) {
                            var val = option.data[p];
                            if (Array.isArray(val)) {
                                for (var m = 0; m < val.length; m++) {
                                    content += p + "=" + encodeURIComponent(val[m]) + "&";
                                }
                            }
                            else {
                                content += p + "=" + encodeURIComponent(option.data[p]) + "&";
                            }
                        }                        
                    }
                }
            }

            var url = option.url;
            if (option.method === "GET" && content.length > 0) {
                if (url.indexOf("?") >= 0)
                    url += "&";
                else
                    url += "?";
                url += content;
            }

            var http = HttpClient.createRequest(option);
            http.withCredentials = option.withCredentials;
            if (option.async) {
                //http.timeout = option.timeout;

                (<any>http)._timer = setTimeout(() => {
                    http.abort();
                    if (option.callback) {
                        var cb = option.callback;
                        option.callback = null;
                        cb(null, "timeout");
                    }
                }, option.timeout);
            }
            http.open(option.method, url, option.async);
            //http.withCredentials = true;//加这个反而无法跨域了

            if (option.header) {
                for (var p in option.header) {
                    http.setRequestHeader(p, option.header[p]);
                }
            }
            if (HttpClient.defaultHeaders) {
                for (var p in HttpClient.defaultHeaders) {
                    if (option.header[p] == undefined) {
                        http.setRequestHeader(p, (<any>HttpClient).defaultHeaders[p]);
                    }
                }
            }
            if (option.method === "POST") {
                http.send(content);
            }
            else
                http.send(null);

            if (option.component)
                option.component.usingHttp(http);
            return http;
        }
        catch (e) {
            if (option.callback) {
                var cb = option.callback;
                option.callback = null;

                if (typeof e === "object") {
                    if (e.message)
                        cb(null, e.message);
                    else
                        cb(null, JSON.stringify(e));
                }
                else if (typeof e === "string") {
                    cb(null, e);
                }
            }

        }
        return null;
    }
}