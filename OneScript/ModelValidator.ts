export enum ValidateType {
    /**不能为空 */
    Required = "Required",
    /**除去左右空白后，不能为空 */
    RequiredAndNotWhitespace = "RequiredAndNotWhitespace",
    /**必须和otherPorpertyName的值相同 */
    SameWith = "SameWith",
    Number = "Number",
    /**验证表达式 */
    CheckExpression ="CheckExpression",
}
export interface ModelValidate {
    /**需要验证的属性 */
    propertyName: string;
    /** */
    otherPorpertyName?: string;
    /**验证类型，默认Required */
    validateType?: ValidateType;
    /**表达式，如果不满足这个表达式，则不通过验证，如 {0}!=0，表示只有当值不等于0时，验证通过 
     也可以是一个function(val) 函数，返回true表示通过，否则表示不通过
     */
    expression?: (value:string)=> boolean|string;
    /**验证不通过时，返回的错误文字 */
    errorText?: string;
}

export class ModelValidator {

    /**
     * 验证model，返回没有通过验证的ModelValidate
     * @param model
     * @param validates
     * @returns 返回没有通过验证的ModelValidate
     */
    static verify(model: any, validates: ModelValidate[]|string[]): ModelValidate[] {
        var errors: ModelValidate[] = [];
        var data = model;

        validates.forEach((validate) => {
            if (typeof validate == "string") {
                validate = {
                    propertyName: validate
                };
            }
                
            if (errors.some(m => m.propertyName == validate.propertyName))
                return;

            if (validate.validateType == undefined)
                validate.validateType = ValidateType.Required;

            var value;
            try {
                eval("value=data." + validate.propertyName);
            } catch (e) {

            }
           
            var othervalue;

            try {
                eval("othervalue=validate.otherPorpertyName ? data." + validate.otherPorpertyName + " : undefined");
            } catch (e) {

            }
           
            var func: any = ModelValidator;
            eval("func = func.verify_" + validate.validateType);
            var result = func(value, othervalue, validate);
            if (!result) {
                errors.push(validate);
            }
        });
        return errors;
    }

    /**
     * 验证model，并把结果放到resultPropertyName指定的属性里，resultPropertyName指定的属性初始值应该是{}
     * 如，resultPropertyName="validator"，然后username和code属性没有通过验证，那么，validator={ username : true, code : errorText }
     * 如果都通过验证，那么 validator={}
     * @param model
     * @param validates
     * @param resultPropertyName
     */
    static verifyToProperty(model: any, validates: ModelValidate[]|string[], resultPropertyName: string) {

        for (var i = 0; i < validates.length; i++) {
            if (typeof validates[i] == "string") {
                eval("model." + resultPropertyName + "." + validates[i] + "=false");
            }
            else {
                eval("model." + resultPropertyName + "." + (<any>validates[i]).propertyName + "=false");
            }
            
        }

        var arr = ModelValidator.verify(model, validates);
        var ret = false;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].errorText) {
                    eval("model." + resultPropertyName + "." + arr[i].propertyName + "=" + JSON.stringify(arr[i].errorText));
                }
                else {
                    eval("model." + resultPropertyName + "." + arr[i].propertyName + "=true");
                }
            }
            ret = false;
        }
        else {
           
            ret = true;
        }
        eval("model." + resultPropertyName + "=JSON.parse(JSON.stringify(model." + resultPropertyName + "))"); 
        return ret;
    }

    private static verify_Required(value: any, otherValue: any, validate: ModelValidate): boolean{
        if (value == undefined || value == null ||value == "")
            return false;
        return true;
    }

    private static verify_Number(value: any, otherValue: any, validate: ModelValidate): boolean {
        if (value == undefined || value == null || value == "")
            return true;

        try {
            var n = parseFloat(value);
            if (isNaN(n))
                return false;
        }
        catch (e) {
            return false;
        }

        return true;
    }

    private static verify_RequiredAndNotWhitespace(value: any, otherValue: any, validate: ModelValidate): boolean {
        value = value.toString().trim();
        if (value)
            return true;
        return false;
    }
    private static verify_SameWith(value: any, otherValue: any, validate: ModelValidate): boolean {
        return value == otherValue;
    }
    private static verify_CheckExpression(value: any, otherValue: any, validate: ModelValidate): boolean {
        if (typeof validate.expression === "function") {
            return (<any>validate).expression(value);
        }
        var curValue = value;
        var expression = validate.expression.replace(/\{0\}/g, "curValue");
        return eval(expression);
    }
}