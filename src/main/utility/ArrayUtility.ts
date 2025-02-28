class ArrayUtilty {
    static transformIntoHashMap<T extends Record<string, any>>(data: T[], groupField: keyof T): Record<string, T> {
        return data.reduce((result: Record<string, T>, currentValue) => {
            result[currentValue[groupField]] = currentValue
            return result
        }, {})
    }

    static transformIntoHashMapArray<T extends Record<string, any>>(data: T[], groupField: keyof T): Record<string, T[]> {
        return data.reduce((result: Record<string, T[]>, currentValue) => {
            const key = currentValue[groupField]
            if (!result[key]) {
                result[key] = []
            }
            result[key].push(currentValue)
            return result
        }, {})
    }

    static checkIfArrayOfObjectHasSameKeys(arr: object[]): boolean {
        if (arr.length === 0) return true

        const firstObjKeys = Object.keys(arr[0])

        return arr.every(obj => {
            const objKeys = Object.keys(obj)
            return firstObjKeys.length === objKeys.length && firstObjKeys.every(key => objKeys.includes(key))
        })
    }

    /**
     * Check two given arrays are identical or not.
     * It also works for array of object.
     * Note: This function only check single level of object, not nested object. 
     * If the object is nested, it will compare the reference of the nested
     * object thus it always return false
     */
    static checkIfIdentical(arr1: any[], arr2: any[], compareField?: string) {
        let objectkeys: string[] = []
        if (arr1.length !== arr2.length)
            return false
        if (arr1.length == 0 && arr2.length == 0)
            return true

        if (typeof arr1[0] == "object") {
            // If keys ampunt is not the same, then it is not identical
            const keysArr1 = Object.keys(arr1[0])
            const keysArr2 = Object.keys(arr2[0])
            if (keysArr1.length !== keysArr2.length)
                return false

            // Only check similarity of keys if both are an array of object
            if ((keysArr1.length > 0 && keysArr2.length > 0)) {
                // If one of the arguments is not having the same keys throughout the array, then throw an error 
                if (!this.checkIfArrayOfObjectHasSameKeys(arr1) || !this.checkIfArrayOfObjectHasSameKeys(arr2))
                    throw new Error("Array must have same keys")
                // If the keys are not the same, then it is not identical
                if (!this.checkIfIdentical(keysArr1, keysArr2))
                    return false
            }
            objectkeys = [...keysArr1]
        }

        // If compareField is provided, then validation only done on that field
        if (compareField) {
            arr1.sort((a, b) => {
                if (typeof a[compareField] == "string")
                    return a[compareField].localeCompare(b[compareField])
                else
                    return a[compareField] - b[compareField]
            })

            arr2.sort((a, b) => {
                if (typeof a[compareField] == "string")
                    return a[compareField].localeCompare(b[compareField])
                else
                    return a[compareField] - b[compareField]
            })

            for (let i = 0; i < arr1.length; i++)
                if (arr1[i][compareField] !== arr2[i][compareField]) {
                    return false
                }
            return true
        }

        else {
            if (objectkeys.length > 0) {
                for (let i = 0; i < arr1.length; i++) {
                    for (const key of objectkeys) {
                        if (arr1[i][key] !== arr2[i][key])
                            return false
                    }
                }
            }
            else {
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i] !== arr2[i])
                        return false
                }
            }
            return true
        }
    }
}

export default ArrayUtilty