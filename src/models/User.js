const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        trim : true,
        index : true,
        unique : true
    }, 
    firstName : {
        type : String,
        trim : true,
    }, 
    lastName : {
        type : String,
        trim : true,
    },
    password : {
        type : String,
        required : true,
        trim : true,
    },
    profile_image_url : {
        type : String,
        trim : true,
        default : null
    },
    email : {
        type : String,
        required : true,
        trim : true,
        index : true,
        unique : true
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
    },
    address : {
        type : String,
        trim : true,
    },
    phoneNumber : {
        type : String,
        trim : true,
    },
    gender : {
        type : String,
        enum : ['female', 'male']
    }

}, {
    timestamps : true,
})

module.exports = mongoose.model("user", UserSchema);

