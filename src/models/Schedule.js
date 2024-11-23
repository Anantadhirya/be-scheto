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
        required : true,
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
    is_private : {
        type : Boolean,
        required: true,
    },
    schedule_type : {
        enum : [...allowed_schedule_type],
        type: String,
        default : "NONE",
        required : true
    }

}, {
    timestamps : true,
})

module.exports = mongoose.model("schedule", Schedule);

