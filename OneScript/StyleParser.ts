export class StyleParser {
    static parse(styleText: string): StyleItem[] {
        var result: StyleItem[] = [];
        var reg = /([^\{^\}]*)([\{\}])/;
        while (styleText.length > 0) {
            var r = reg.exec(styleText);
            if (r && r.length > 0) {
                if (styleText.length === r[0].length)
                    break;
                
                styleText = styleText.substr(r[0].length);
                var item = new StyleItem();
                item.name = r[1].trim();
                if (r[2] === "{") {
                    result.push(item);
                    styleText = item.parse(styleText);
                }
                else {
                    continue;
                }
            }
            else {
                break;
            }
        }
        return result;
    }
}

export class StyleItem {
    children: StyleItem[] = [];
    content: string;
    name: string;
    parse(styleText: string): string {
       
        var reg = /([^\{^\}]*)([\{\}])/;
        while (styleText.length > 0) {
            var r = reg.exec(styleText);
            if (!r || r.length == 0) {
                return "";
            }
            //if (styleText.length === r[0].length) {
            //    debugger;
            //    return "";
            //}
                

            styleText = styleText.substr(r[0].length);

            if (r[2] == "}") {
                this.content = r[1];
                break;
            }
            else {
                var item = new StyleItem();
                item.name = r[1].trim();
                this.children.push(item);
                styleText = item.parse(styleText);
            }
        }
        return styleText;
    }

    toString(urlRoot: string = undefined): string {
        var content = this.content;
        if (urlRoot) {
            var reg = /url[ ]*\(([^\(\)]+)\)/g;
            var items = [];
            while (true) {
                var r = reg.exec(content);
                if (r && r.length > 0) {
                    var p : any = r[1].trim();
                    if (p.startsWith("http:") || p.startsWith("https:") || p.startsWith("#")) {

                    }
                    else {
                        content = content.replace(reg, "$_" + items.length);
                        items.push(r[1]);                       
                    }
                }
                else {
                    break;
                }
            }
            for (var i = 0; i < items.length; i++) {
                while (content.indexOf("$_" + i) >= 0) {
                    content = content.replace("$_" + i, "url(" + urlRoot + items[i] + ")");
                }
            }
        }

        if (this.children.length == 0)
            return this.name + "{" + content + "}\r\n";
        else {
            var result = this.name + "{\r\n";
            this.children.forEach((item) => {
                result += item.toString(urlRoot);
            });
            return result + "}\r\n";
        }
    }

}