import { registerSelector } from "./Selector"
import { registerLoading } from "./Loading";

export class VueComponents {
    /**
     * 
     * @param tagname html标签名字，默认<selector>
     */
    static useSelector(tagname: string = "selector") {
        registerSelector(tagname);
    }

    /**
     * 
     * @param tagname html标签名字，默认<loading>
     */
    static useLoading(tagname: string = "loading") {
        registerLoading(tagname);
    }
}