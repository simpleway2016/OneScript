export interface IHttpClientUsing {
    usingHttp(http: XMLHttpRequest): void;
    freeHttp(http: XMLHttpRequest): void;
}
