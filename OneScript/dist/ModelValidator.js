export var ValidateType;
(function (ValidateType) {
    /**不能为空 */
    ValidateType["Required"] = "Required";
    /**除去左右空白后，不能为空 */
    ValidateType["RequiredAndNotWhitespace"] = "RequiredAndNotWhitespace";
    /**必须和otherPorpertyName的值相同 */
    ValidateType["SameWith"] = "SameWith";
    ValidateType["Number"] = "Number";
    /**验证表达式 */
    ValidateType["CheckExpression"] = "CheckExpression";
})(ValidateType || (ValidateType = {}));
var ModelValidator = /** @class */ (function () {
    function ModelValidator() {
    }
    /**
     * 验证model，返回没有通过验证的ModelValidate
     * @param model
     * @param validates
     * @returns 返回没有通过验证的ModelValidate
     */
    ModelValidator.verify = function (model, validates) {
        var errors = [];
        var data = model;
        validates.forEach(function (validate) {
            if (validate.validateType == undefined)
                validate.validateType = ValidateType.Required;
            var value;
            try {
                eval("value=data." + validate.propertyName);
            }
            catch (e) {
            }
            var othervalue;
            try {
                eval("othervalue=validate.otherPorpertyName ? data." + validate.otherPorpertyName + " : undefined");
            }
            catch (e) {
            }
            var func = ModelValidator;
            eval("func = func.verify_" + validate.validateType);
            var result = func(value, othervalue, validate);
            if (!result) {
                errors.push(validate);
            }
        });
        return errors;
    };
    /**
     * 验证model，并把结果放到resultPropertyName指定的属性里，resultPropertyName指定的属性初始值应该是{}
     * 如，resultPropertyName="validator"，然后username和code属性没有通过验证，那么，validator={ username : true, code : true }
     * 如果都通过验证，那么 validator={}
     * @param model
     * @param validates
     * @param resultPropertyName
     */
    ModelValidator.verifyToProperty = function (model, validates, resultPropertyName) {
        for (var i = 0; i < validates.length; i++) {
            eval("model." + resultPropertyName + "." + validates[i].propertyName + "=false");
        }
        var arr = ModelValidator.verify(model, validates);
        var ret = false;
        if (arr.length > 0) {
            for (var i = 0; i < arr.length; i++) {
                eval("model." + resultPropertyName + "." + arr[i].propertyName + "=true");
            }
            ret = false;
        }
        else {
            ret = true;
        }
        eval("model." + resultPropertyName + "=JSON.parse(JSON.stringify(model." + resultPropertyName + "))");
        return ret;
    };
    ModelValidator.verify_Required = function (value, otherValue, validate) {
        if (value == undefined || value == null || value == "")
            return false;
        return true;
    };
    ModelValidator.verify_Number = function (value, otherValue, validate) {
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
    };
    ModelValidator.verify_RequiredAndNotWhitespace = function (value, otherValue, validate) {
        value = value.toString().trim();
        if (value)
            return true;
        return false;
    };
    ModelValidator.verify_SameWith = function (value, otherValue, validate) {
        return value == otherValue;
    };
    ModelValidator.verify_CheckExpression = function (value, otherValue, validate) {
        var curValue = value;
        var expression = validate.expression.replace(/\{0\}/g, "curValue");
        return eval(expression);
    };
    return ModelValidator;
}());
export { ModelValidator };
//# sourceMappingURL=ModelValidator.js.map