abstract class StringUtility {
    static generateRandomNumber(min: number, max: number) {
        return (Math.floor(Math.random() * (max - min + 1)) + min).toString()
    }

    static setXAsTrue(value: string[]): boolean[] {
        const result = value.map(value => {
            if (value.toLowerCase() == "x") return true
            return undefined
        }) as boolean[]
        return result
    }

    static isUUID(text: string): boolean {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-7][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

        return uuidRegex.test(text)
    }

    static camelCaseToTitleCase(text: string): string {
        return text
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function (str) { return str.toUpperCase() })
            .trim()
    }

    static titleCaseToCamelCase(text: string) {
        return text
            .toLowerCase()
            .split(' ')
            .map((word, index) => {
                if (index === 0) {
                    return word
                }
                return word.charAt(0).toUpperCase() + word.slice(1)
            }).join('')
    }

    static snakeCaseToCamelCase(snakeStr: string): string {
        return snakeStr.toLowerCase().replace(/(_\w)/g, (matches) => matches[1].toUpperCase())
    }

    static pascalCaseToSnakeCase(text: string) {
        return text.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
    }

    static pascalCaseToCamelCase(str: string) {
        return str.charAt(0).toLowerCase() + str.slice(1)
    }

    static pascalCaseToTitleCase(text: string) {
        let result = text.replace(/([a-z])([A-Z])/g, '$1 $2').trim()
        result = result.replace(/\b\w/g, char => char.toUpperCase())
        return result
    }

    static snakeCaseToPascalCase(snake: string): string {
        return snake
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
    }

    static titleCaseToPascalCase(text: string) {
        return text.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
    }

    static formatRupiah(numberData: number) {
        return `Rp ${numberData.toLocaleString("id")}`
    }
}

export default StringUtility