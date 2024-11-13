const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        trim : true,
        index : true
    }, 
    password : {
        type : String,
        required : true,
        trim : true,
    },
    email : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    joined_group : {
        type : [{
            id_group : {
                ref : 'group',
                required : true,
                type : mongoose.Schema.Types.ObjectId
            },
            joinedAt : {
                type : Date,
                default : new Date(),
                required : true
            }
        }],
        required : true,
        default : []
    }

}, {
    timestamps : true,
})

module.exports = mongoose.model("user", UserSchema);

