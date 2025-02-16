abstract class DateUtility {
    static getMonthName(monthNumber: number) {
        const monthsEn = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]

        const monthsId = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ]

        if (monthNumber < 1 || monthNumber > 12) {
            throw new Error("Invalid month number")
        }

        return {
            monthId: monthsId[monthNumber - 1],
            monthEn: monthsEn[monthNumber - 1],
        }
    }

    static getTimeDifference(startTime: Date | string, endTime: Date | string) {
        startTime = new Date(startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        endTime = new Date(endTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })

        const [startHours, startMinutes] = startTime.split(':').map(Number)
        const [endHours, endMinutes] = endTime.split(':').map(Number)

        const startDate = new Date(0, 0, 0, startHours, startMinutes)
        const endDate = new Date(0, 0, 0, endHours, endMinutes)

        let diff = endDate.getTime() - startDate.getTime()

        if (diff < 0) {
            diff += 24 * 60 * 60 * 1000
        }

        return {
            hours: Math.floor(diff / (1000 * 60 * 60)) - 1,
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        }
    }

    static dateDifference(startDate: string | Date, endDate: string | Date) {
        // Convert the startDate and endDate to Date objects if they are strings
        const start = typeof startDate === "string" ? new Date(startDate) : startDate
        const end = typeof endDate === "string" ? new Date(endDate) : endDate

        let years = end.getFullYear() - start.getFullYear()
        let months = end.getMonth() - start.getMonth()

        if (months < 0) {
            years--
            months += 12
        }

        return {
            years,
            months,
            textEn: `${years} Years ${months} Months`,
            textId: `${years} Tahun ${months} Bulan`,
        }
    }

    static getTodayDate(daysOffset: number = 0): string {
        const today = new Date()
        today.setDate(today.getDate() + daysOffset)
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')

        return `${yyyy}-${mm}-${dd}`
    }

    static toCommonDateFormat(date: Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    static accumulateDate(date: Date | string, accumulateNumber: number): Date {
        const initialDate = new Date(date)
        const resultDate = new Date(initialDate)
        resultDate.setDate(resultDate.getDate() + accumulateNumber)
        return resultDate
    }

    static getDateDifference(date1: Date | string, date2: Date | string, rounding?: boolean) {
        date1 = new Date(date1)
        date2 = new Date(date2)

        let years = date2.getFullYear() - date1.getFullYear()
        let months = date2.getMonth() - date1.getMonth()
        let days = date2.getDate() - date1.getDate()

        // Adjust for negative days and months
        if (days < 0) {
            months--
            const lastMonth = new Date(date2.getFullYear(), date2.getMonth(), 0)
            days += lastMonth.getDate()
        }

        if (months < 0) {
            years--
            months += 12
        }

        if (rounding)
            return {
                year: months == 11 && days != 0 ? years + 1 : years,
                month: months == 11 && days != 0 ? 0 : months,
                day: 0
            }
        return {
            year: years,
            month: months,
            day: days
        }
    }

    static formatToIndonesiaDate(date: Date | string) {
        if (typeof date === 'string') date = new Date(date)
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: "numeric" })
    }

    static yearsDifference(date1: Date | string, date2: Date | string) {
        date1 = typeof date1 === 'string' ? new Date(date1) : date1
        date2 = typeof date2 === 'string' ? new Date(date2) : date2
        const result = Math.abs(date1.getFullYear() - date2.getFullYear())
        return {
            textId: `${result} Tahun`,
            textEn: `${result} Years`,
            value: result,
        }
    }
}

export default DateUtility
