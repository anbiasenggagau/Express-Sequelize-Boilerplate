import StringUtility from "./StringUtility";

abstract class ObjectUtility {
    static convertKeysToCamelCase(obj: any) {
        if (Array.isArray(obj)) {
            return obj.map(item => StringUtility.snakeCaseToCamelCase(item));
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((result, key) => {
                const camelCaseKey = StringUtility.snakeCaseToCamelCase(key);
                result[camelCaseKey] = this.convertKeysToCamelCase(obj[key]);
                return result;
            }, {} as any);
        }
        return obj;
    }
}

export default ObjectUtility