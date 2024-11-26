const asyncHandler = require("express-async-handler");
const { validationResult } = require('express-validator');

const User = require("../models/User")
const Inbox = require("../models/Inbox")


/**
    PATCH /profile/detail
    Ubah profil user
    req : name, email, gender, nomor_telepon, alamat_rumah
*/
const PatchProfileUser = asyncHandler(async (req,res,next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    

    // update
    let anyChanged = false;
    if(req.body.firstName) {
        req.user.firstName = req.body.firstName;
        anyChanged = true;
    }
    if(req.body.lastName) {
        req.user.lastName = req.body.lastName;
        anyChanged = true;
    }
    if(req.body.phoneNumber) {
        req.user.phoneNumber = req.body.phoneNumber;
        anyChanged = true;
    }
    if(req.body.address) {
        req.user.address = req.body.address;
        anyChanged = true;
    }
    if(req.body.email) {
        // cek email nya 
        const findEmail = User.find({email : req.body.email});
        if(findEmail) {
            return res.status(400).json({message : "Email is already used"})
        }
        req.user.email = req.body.email;
        anyChanged = true;
    }
    if(req.body.gender) {
        req.user.gender = req.body.gender;
        anyChanged = true;
    }
    if(anyChanged) {
        await req.user.save();
    }

    return res.status(201).json({message : "Profile has been updated"})
})

/**
    GET /profile/detail
    Detail profil user
    query : cursor
*/
const GetProfileDetail = asyncHandler(async (req,res,next) => {
    // data user 
    const dataUser = await User.findById(req.user._id).select("username firstName lastName email address phoneNumber gender _id profile_image_url").lean();
    //console.log(dataUser)

    return res.status(201).json(dataUser)
})

/**
    GET /profile/inbox
    Get inbox bagi user
*/
const GetUserInboxByNewest = asyncHandler(async (req,res,next) => {
    const getInbox = await Inbox.find({$or : [
        {for_user_id : req.user._id},
        {for_group_id : {$in : req.user.joined_group}}
        
    ]})
    .sort({createdAt : -1})
    .lean();

    return res.status(201).json({inbox : [...getInbox]})
})

module.exports = {
    GetProfileDetail,
    GetUserInboxByNewest,
    PatchProfileUser
}