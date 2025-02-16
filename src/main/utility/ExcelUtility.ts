import ExcelJS from "exceljs"

abstract class ExcelUtilty {
    static adjustColumnWidth(worksheet: ExcelJS.Worksheet) {
        worksheet.columns.forEach(column => {
            const lengths = column.values!.map(value => {
                if (value == null || value == undefined)
                    return 0
                else if (value instanceof Date)
                    return 15
                else
                    return (value as string).toString().length
            })
            let maxLength = Math.max(...lengths.filter(v => typeof v === 'number'))
            maxLength = maxLength < 15 ? 15 : maxLength * 1.2
            column.width = maxLength
        })
    }

    static adjustCellValue(value: any): string {
        if (value == null) return ""
        else return value as string
    }
}

export default ExcelUtilty