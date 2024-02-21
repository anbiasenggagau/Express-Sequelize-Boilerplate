abstract class DateUtility {
    static timeDifference(date1: Date, date2: Date) {
        const diff = Math.abs(date2.getTime() - date1.getTime());

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor(((diff % 3600000) % 60000) / 1000);

        return hours + "h " + minutes + "m " + seconds + "s";
    }
}

export default DateUtility