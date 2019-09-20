var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { isArray } from "util";
var HttpClient = /** @class */ (function () {
    function HttpClient() {
    }
    HttpClient.createRequest = function (option) {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (http.readyState == 4) {
                if (http._timer) {
                    clearTimeout(http._timer);
                    http._timer = undefined;
                }
                if (http.status == 200) {
                    if (option && option.component) {
                        option.component.freeHttp(http);
                    }
                    if (option && option.callback) {
                        option.callback(http.responseText, null);
                    }
                }
                else {
                    if (option && option.component) {
                        option.component.freeHttp(http);
                    }
                    if (option && option.callback) {
                        var cb = option.callback;
                        option.callback = null;
                        if (http._aborted) {
                            cb(null, "http aborted");
                        }
                        else {
                            cb(null, { status: http.status, msg: http.responseText });
                        }
                    }
                }
            }
        };
        http.onerror = function (e) {
            if (http._timer) {
                clearTimeout(http._timer);
                http._timer = undefined;
            }
            if (option && option.component) {
                option.component.freeHttp(http);
            }
            if (option && option.callback) {
                var cb = option.callback;
                option.callback = null;
                var msg = "network error";
                if (e && e.target) {
                    if (e.target.status === 0)
                        msg = "连接未初始化，可能是跨域问题引起的";
                }
                cb(null, msg);
            }
        };
        http.ontimeout = function () {
            if (http._timer) {
                clearTimeout(http._timer);
                http._timer = undefined;
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
    };
    HttpClient.createDefaultOption = function (source) {
        var option = HttpClient.defaultOption;
        for (var p in option) {
            if (source[p] === undefined) {
                source[p] = option[p];
            }
        }
    };
    /**
     * option.data以json方式post到服务器
     * @param option
     */
    HttpClient.postJsonAsync = function (option) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        option.callback = function (ret, err) {
                            if (err)
                                reject(err);
                            else
                                resolve(ret);
                        };
                        HttpClient.postJson(option);
                    })];
            });
        });
    };
    /**
     * option.data以json方式post到服务器
     * @param option
     */
    HttpClient.postJson = function (option) {
        if (!option.header)
            option.header = {};
        option.header["Content-Type"] = "application/json";
        return HttpClient.send(option);
    };
    /**
     * 发送请求到服务器
     * @param option
     */
    HttpClient.sendAsync = function (option) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        option.callback = function (ret, err) {
                            if (err)
                                reject(err);
                            else
                                resolve(ret);
                        };
                        HttpClient.send(option);
                    })];
            });
        });
    };
    /**
     * 发送请求到服务器
     * @param option
     */
    HttpClient.send = function (option) {
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
        if (option.header["Content-Type"] === undefined && option.method === "POST")
            option.header["Content-Type"] = "application/x-www-form-urlencoded";
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
                        var data = option.data;
                        content = new Blob([data], { type: 'application/json' });
                    }
                    else {
                        content = JSON.stringify(option.data);
                    }
                }
                else {
                    for (var p in option.data) {
                        if (option.data[p] != undefined) {
                            var val = option.data[p];
                            if (isArray(val)) {
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
                http._timer = setTimeout(function () {
                    http.abort();
                    if (option.callback) {
                        option.callback(null, "timeout");
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
                        http.setRequestHeader(p, HttpClient.defaultHeaders[p]);
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
    };
    HttpClient.defaultOption = {
        timeout: 30000,
        async: true,
        method: "POST",
        url: undefined,
        sendInBlob: false,
        withCredentials: false,
    };
    HttpClient.defaultHeaders = {};
    return HttpClient;
}());
export { HttpClient };
//# sourceMappingURL=HttpClient.js.map