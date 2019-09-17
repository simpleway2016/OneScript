export declare enum ValidateType {
    /**不能为空 */
    Required = "Required",
    /**除去左右空白后，不能为空 */
    RequiredAndNotWhitespace = "RequiredAndNotWhitespace",
    /**必须和otherPorpertyName的值相同 */
    SameWith = "SameWith",
    Number = "Number",
    /**验证表达式 */
    CheckExpression = "CheckExpression"
}
export interface ModelValidate {
    /**需要验证的属性 */
    propertyName: string;
    /** */
    otherPorpertyName?: string;
    /**验证类型，默认Required */
    validateType?: ValidateType;
    /**表达式，如果不满足这个表达式，则不通过验证，如 {0}!=0，表示只有当值不等于0时，验证通过 */
    expression?: string;
    /**验证不通过时，返回的错误文字 */
    errorText?: string;
}
export declare class ModelValidator {
    /**
     * 验证model，返回没有通过验证的ModelValidate
     * @param model
     * @param validates
     * @returns 返回没有通过验证的ModelValidate
     */
    static verify(model: any, validates: ModelValidate[]): ModelValidate[];
    /**
     * 验证model，并把结果放到resultPropertyName指定的属性里，resultPropertyName指定的属性初始值应该是{}
     * 如，resultPropertyName="validator"，然后username和code属性没有通过验证，那么，validator={ username : true, code : true }
     * 如果都通过验证，那么 validator={}
     * @param model
     * @param validates
     * @param resultPropertyName
     */
    static verifyToProperty(model: any, validates: ModelValidate[], resultPropertyName: string): boolean;
    private static verify_Required;
    private static verify_Number;
    private static verify_RequiredAndNotWhitespace;
    private static verify_SameWith;
    private static verify_CheckExpression;
}
