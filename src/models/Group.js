const mongoose = require("mongoose");



const GroupSchema = new mongoose.Schema({
    group_name : {
        type : String,
        required : true,
        trim : true,
    }, 
    id_leader : {
        ref : 'user',
        required : true,
        type : mongoose.Schema.Types.ObjectId
    },
    member_id : {
        type : [{
            id_user : {
                ref : 'user',
                required : true,
                type : mongoose.Schema.Types.ObjectId
            },
            joinedAt : {
                type : Date,
                default : new Date(),
                required : true
            }
        }],
        default : [],
        required : true
    },
    invite_code : {
        type :String,
        required :true,
        trim :true,
        index : true,
        unique : true
    }

}, {
    timestamps : true,
})

module.exports = mongoose.model("group", GroupSchema);

