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
export declare class HttpClient {
    static defaultOption: HttpClientOption;
    /**如果返回true，则send会取消*/
    static BeforeSend: (option: HttpClientOption) => boolean;
    static defaultHeaders: {};
    private static createRequest;
    private static createDefaultOption;
    /**
     * option.data以json方式post到服务器
     * @param option
     */
    static postJsonAsync(option: HttpClientOption): Promise<string>;
    /**
     * option.data以json方式post到服务器
     * @param option
     */
    static postJson(option: HttpClientOption): XMLHttpRequest;
    /**
     * 发送请求到服务器
     * @param option
     */
    static sendAsync(option: HttpClientOption): Promise<string>;
    /**
     * 发送请求到服务器
     * @param option
     */
    static send(option: HttpClientOption): XMLHttpRequest;
}
