import StringUtility from "./StringUtility";

abstract class ObjectUtility {
    static convertKeysToCamelCase(obj: any) {
        if (Array.isArray(obj)) {
            return obj.map(item => StringUtility.snakeCaseToCamelCase(item))
        } else if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((result, key) => {
                const camelCaseKey = StringUtility.snakeCaseToCamelCase(key)
                result[camelCaseKey] = this.convertKeysToCamelCase(obj[key])
                return result
            }, {} as any)
        }
        return obj
    }

    static isObjectEqual(obj1: any, obj2: any): boolean {
        if (obj1 === obj2) {
            return true
        }

        if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
            return false
        }

        const keys1 = Object.keys(obj1)
        const keys2 = Object.keys(obj2)

        if (keys1.length !== keys2.length) {
            return false
        }

        for (const key of keys1) {
            if (!keys2.includes(key) || !this.isObjectEqual(obj1[key], obj2[key])) {
                return false
            }
        }

        return true
    }
}

export default ObjectUtility