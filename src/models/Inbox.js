const mongoose = require("mongoose");



const InboxSchema = new mongoose.Schema({
    message : {
        type : String,
        required : true,
        trim : true,
    }, 
    is_for_individual : {
        type : Boolean,
        required : true,
    },
    for_group_id : {
        ref : 'group',
        default : null,
        type : mongoose.Schema.Types.ObjectId
    },
    for_user_id : {
        ref : 'user',
        default : null,
        type : mongoose.Schema.Types.ObjectId
    },

}, {
    timestamps : true,
})

module.exports = mongoose.model("inbox", InboxSchema);

