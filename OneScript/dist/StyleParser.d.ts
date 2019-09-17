export declare class StyleParser {
    static parse(styleText: string): StyleItem[];
}
export declare class StyleItem {
    children: StyleItem[];
    content: string;
    name: string;
    parse(styleText: string): string;
    toString(urlRoot?: string): string;
}
