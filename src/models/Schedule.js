const mongoose = require("mongoose");
const { allowed_schedule_type } = require("../utils/const_var")



const Schedule = new mongoose.Schema({
    is_user_owned : {
        type : Boolean,
        required : true,
    }, 
    id_creator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        default : null
    },
    group_data : {
        member_joining : [{
            ref : 'user',
            type : mongoose.Schema.Types.ObjectId
        }],
        member_rejected : [{
            ref : 'user',
            type : mongoose.Schema.Types.ObjectId
        }],
        id_group : {
            ref : 'group',
            type : mongoose.Schema.Types.ObjectId,
            default : null
        }
    },
    title : {
        type : String,
        required : true,
        trim : true,
    },
    description : {
        type : String,
        trim : true,
    },
    start_time : {
        type : Date,
        required : true,
    },
    end_time : {
        type : Date,
        required : true,
    },
    repeat_until : {
        type : Date,
        default : null,
    },
    is_private : {
        type : Boolean,
        required: true,
    },
    schedule_type : {
        enum : [...allowed_schedule_type],
        type: String,
        default : "NONE",
        required : true
    },
    recurrence: {
        // Define recurrence details only if schedule_type is DAILY, WEEKLY, or MONTHLY
        daily: {
            enabled: {
                type: Boolean,
                default: false,
            },
        },
        weekly: {
            enabled: {
                type: Boolean,
                default: false,
            },
            days_of_week: 
                {
                    type: String,
                    enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                },
        },
        monthly: {
            enabled: {
                type: Boolean,
                default: false,
            },
            dates: [
                {
                    type: Number, // Days of the month (e.g., 1 for the first day, 15 for the 15th)
                    min: 1,
                    max: 31,
                },
            ],
        },
    },
    duration : {
        required : true,
        type : Number
    }

}, {
    timestamps : true,
})

// Indexes for performance optimization
Schedule.index({ start_time: 1, end_time: 1 });
Schedule.index({ is_user_owned: 1 });
Schedule.index({ id_creator: 1 });
Schedule.index({ "group_data.id_group": 1 });
Schedule.index({ schedule_type: 1 });
Schedule.index({ is_private: 1 });
Schedule.index({ "recurrence.daily.enabled": 1 });
Schedule.index({ "recurrence.weekly.enabled": 1 });
Schedule.index({ "recurrence.monthly.enabled": 1 });
Schedule.index({ id_creator: 1, start_time: 1 });

module.exports = mongoose.model("schedule", Schedule);

