abstract class StringUtility {
    static generateRandomNumber(min: number, max: number) {
        return (Math.floor(Math.random() * (max - min + 1)) + min).toString()
    }

    static generateArrayOfUniqueRandomNumber(min: number, max: number, length: number): string[] {
        const result: string[] = []
        for (let i = 1; i <= length; i++) {
            result.push(this.generateRandomNumber(min, max))
        }
        const checkUnique = new Set(result)
        if (checkUnique.size != result.length) return this.generateArrayOfUniqueRandomNumber(min, max, length)
        return result
    }

    static setXAsTrue(value: string[]): boolean[] {
        const result = value.map(value => {
            if (value.toLowerCase() == "x") return true
            return undefined
        }) as boolean[]
        return result
    }
}

export default StringUtility