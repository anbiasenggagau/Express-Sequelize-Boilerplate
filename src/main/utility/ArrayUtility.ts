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

    static checkIfIdentical(arr1: any[], arr2: any[], compareField?: string) {
        if (arr1.length !== arr2.length) {
            return false
        }

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
        }

        if (compareField) {
            for (let i = 0; i < arr1.length; i++)
                if (arr1[i][compareField] !== arr2[i][compareField]) {
                    return false
                }
            return true
        }

        else {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i])
                    return false
            }
            return true
        }
    }
}

export default ArrayUtilty