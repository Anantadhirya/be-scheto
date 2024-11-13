const enum_schedule_type = {
    DAILY : "DAILY",
    WEEKLY : "WEEKLY",
    MONTHLY : "MONTHLY",
    NONE : "NONE"
}

const allowed_schedule_type = [
    "DAILY", 
    "WEEKLY", 
    "MONTHLY", 
    "NONE"
]


module.exports = {
    allowed_schedule_type,
    enum_schedule_type
}