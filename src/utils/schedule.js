const { eachDayOfInterval, isWithinInterval, addDays, addMonths, setDate, getDay, format, addHours, differenceInDays, addMinutes } = require('date-fns');

function getDailyOccurrences(scheduleStart, scheduleEnd, rangeStart, rangeEnd, duration) {
    const occurrences = [];
    
    let currentDate = new Date(scheduleStart);
    const endDate = new Date(scheduleEnd);
    
    // Ensure the schedule ends after its start
    if (currentDate > endDate) return occurrences;

    // Find all the days between the schedule start and end time
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    //console.log("DAYS", days)

    days.forEach(day => {
        const dayDifferent = Math.abs(differenceInDays(day, scheduleStart))
        const new_start = addDays(scheduleStart, dayDifferent)
        occurrences.push({
            start_time: new_start,
            end_time: addMinutes(new_start, duration)
        });
    });
    console.log(occurrences)
    return occurrences;
}

function getWeeklyOccurrences(scheduleStart, scheduleEnd, rangeStart, rangeEnd, daysOfWeek) {
    const occurrences = [];
    
    let currentDate = new Date(scheduleStart);
    const endDate = new Date(scheduleEnd);

    // Ensure the schedule ends after its start
    if (currentDate > endDate) return occurrences;

    // Find all the days between the schedule start and end time
    const days = eachDayOfInterval({ start: currentDate, end: endDate });

    days.forEach(day => {
        const dayOfWeek = getDay(day); // Get the day of the week (0: Sunday, 6: Saturday)
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek];
        
        if (daysOfWeek == dayName && isWithinInterval(day, { start: rangeStart, end: rangeEnd })) {
            occurrences.push({
                start_time: new Date(day),
                end_time: addDays(new Date(day), (endDate - currentDate) / (1000 * 60 * 60 * 24)), // Same duration
            });
        }
    });

    return occurrences;
}

 function getMonthlyOccurrences(scheduleStart, scheduleEnd, rangeStart, rangeEnd, daysOfMonth) {
    const occurrences = [];
    
    let currentDate = new Date(scheduleStart);
    const endDate = new Date(scheduleEnd);

    // Ensure the schedule ends after its start
    if (currentDate > endDate) return occurrences;

    // Loop through the months
    while (currentDate <= rangeEnd) {
        daysOfMonth.forEach(day => {
            const dayInMonth = setDate(new Date(currentDate), day); // Set the specific day of the month
            if (isWithinInterval(dayInMonth, { start: rangeStart, end: rangeEnd })) {
                occurrences.push({
                    start_time: dayInMonth,
                    end_time: addMonths(dayInMonth, 1), // Same duration
                });
            }
        });

        // Move to the next month
        currentDate = addMonths(currentDate, 1);
    }

    return occurrences;
}

module.exports = {
    getDailyOccurrences,
    getMonthlyOccurrences,
    getWeeklyOccurrences
}
