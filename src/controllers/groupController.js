const asyncHandler = require("express-async-handler");
const { validationResult } = require('express-validator');
const mongoose = require("mongoose")

const User = require("../models/User")
const Group = require("../models/Group")
const Schedule = require("../models/Schedule")

/**
    DELETE /group/leave/:groupID
    Leave dari group
*/
const LeaveGroup = asyncHandler(async (req,res,next) => {
    if(req.isLeader) {
        return res.status(401).json({message : "You are a leader, cannot leave the group"})
    }

    const session = await mongoose.startSession();
    try {
        // hapus dari group
        session.startTransaction()
        await Group.findByIdAndUpdate(req.group._id, 
            {
                $pull : { member_id : req.user._id}
            },
            { 
                session : session
            }
        )

        // hapus dari user
        await User.findByIdAndUpdate(req.user._id, 
            {
                $pull: { joined_group: { id_group: req.params.groupID } }
            }, 
            {
                session : session
            }
        )
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
    
    return res.status(201).json({message : "Successfully leave the group"})

})

/**
    PATCH /group/join/:groupID
    Join suatu group
*/
const JoinGroup = asyncHandler(async (req,res,next) => {
    const { groupCode } = req.params;

    let groupID;
    const checkGroup = await Group.findOne({invite_code : groupCode}).lean();
    if(!checkGroup) {
        // group doesnt exist
        return res.status(401).json({message : "Group not found"})
    }
    if(req.user.joined_group.includes(groupCode) && (checkGroupMember.member_id.includes(req.user._id) || checkGroupMember.id_leader == req.user_id)) {
        // sudah dalam grup
        return res.status(400).json({message : "Already in group"})
    } 

    const session = await mongoose.startSession();
    try {
        // hapus dari group
        session.startTransaction()
        const updatedGroup = await Group.findByIdAndUpdate(checkGroup._id, 
            {
                $push : { member_id : {id_user : req.user._id}, joinedAt : new Date()}
            },
            { 
                session : session,
                new : true
            }
        )

        // hapus dari user
        await User.findByIdAndUpdate(req.user._id, 
            {
                $push: { joined_group: { id_group: updatedGroup._id }, joinedAt : new Date() }
            }, 
            {
                session : session
            }
        )
        groupID = updatedGroup._id
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
    
    return res.status(201).json({message : "Successfully joined the group", groupId : groupID})

})

/**
    PATCH /group/:groupID/generate-code
    Craete suatu group
*/
const GenerateCode = asyncHandler(async (req,res,next) => {
    // cek jika leader
    if(!req.isLeader) {
        return res.status(401).json({message : "Only leader can regenerate invite code"})
    }
    const newInvite = "#" + req.group.group_name + "-" + `${Date.now()}`
    await Group.findByIdAndUpdate(req.group._id, {
        invite_code : newInvite
    })
    
    return res.status(201).json({message : "New invite code created", newInvite})

})

/**
    +POST+ /group/create
    Craete suatu group
*/
const CreateGroup = asyncHandler(async (req,res,next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    let newId; 
    const session = await mongoose.startSession();
    try {
        // Create the group
        session.startTransaction()
        const newGroup = await Group.create([{
            group_name : req.body.group_name,
            id_leader : req.user._id,
            invite_code : "#" + req.body.group_name + "-" + `${Date.now()}`,
            member_id: [] // Default empty array
        }], {
            session : session,
        });

        console.log(newGroup)

        // hapus dari user
        await User.findByIdAndUpdate(req.user._id, 
            {
                $push: { joined_group: { id_group: newGroup[0]._id }, joinedAt : new Date() }
            }, 
            {
                session : session
            }
        )
        newId = newGroup[0]._id
        await session.commitTransaction();
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
    
    return res.status(201).json({message : "Successfully created the group", newID : newId})

})

/**
    GET /group/list
    List group dari user
*/
const ListGroupUser = asyncHandler(async (req,res,next) => {
    const groupIds = req.user.joined_group.map((value) => value.id_group)
    console.log(groupIds)
    const groups = await Group.find({ _id: { $in: groupIds } })
        .populate({
            path: 'id_leader', // Populate leader field
            select: 'username profile_image_url', // Only include these fields
        })
        .populate({
            path: 'member_id.id_user', // Populate members' user field
            select: 'username profile_image_url', // Only include these fields
        })
        .lean();
    
    return res.status(201).json({list : [...groups]})

})

/**
    GET /id/:groupID/detail
    List detail mengenai group
*/
const DetailGroup = asyncHandler(async (req,res,next) => {
    const groups = await Group.findById(req.params.groupID)
        .populate({
            path: 'id_leader', // Populate leader field
            select: 'username profile_image_url firstName lastName address phoneNumber email', // Only include these fields
        })
        .populate({
            path: 'member_id.id_user', // Populate members' user field
            select: 'username profile_image_url firstName lastName address phoneNumber email', // Only include these fields
        })
        .lean();
    
    return res.status(201).json({group : groups})

})

/**
    GET /id/:groupID/member
    List detail mengenai group
*/
const DetailAnggotaGroup = asyncHandler(async (req,res,next) => {
    const groups = await Group.findById(req.params.groupID)
        .populate({
            path: 'id_leader', // Populate leader field
            select: 'username profile_image_url firstName lastName address phoneNumber email', // Only include these fields
        })
        .populate({
            path: 'member_id.id_user', // Populate members' user field
            select: 'username profile_image_url firstName lastName address phoneNumber email', // Only include these fields
        })
        .select("member_id id_leader")
        .lean();
    
    return res.status(201).json({group : groups})

})

/**
    GET /id/:groupID/schedule
    Dapatkan semua schedule event group dan anggota
    query : {
        startTime,
        endTime,
        is_all
    }
*/
const GetScheduleGroup = asyncHandler(async (req,res,next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { startTime, endTime, is_all } = req.query
    const { groupID } = req.params
    const query = 
        is_all == "true" ? 
        { 
            'group_data.id_group': { $eq: groupID }, // Only include documents where id_group is not null  
        }
        :
        { 
            'group_data.id_group': { $eq: groupID }, // Only include documents where id_group is not null
            start_time: { $gte: startTime, $lte: endTime }, // Filter by start_time within the range    
        }
    const schedulesGroup = await Schedule.find(query)
        .populate({
            path: 'id_creator',
            select: 'username email', // Include only specific fields from the user document
        })
        .populate({
            path: 'group_data.member_joining',
            select: 'username email _id', // Include only specific fields for joining members
        })
        .populate({
            path: 'group_data.member_rejected',
            select: 'username email _id', // Include only specific fields for rejected members
        })
        .select("id_creator group_data is_user_owned title description start_time end_time schedule_type _id")
        .lean();
    

    const idMember = req.group.member_id.map((value) => value.id_user);
    const individualMemberSchedule = await Schedule.find({ 
        id_creator: { $in: idMember}, 
        is_user_owned: true, 
    })
        .populate({
            path: 'id_creator',
            select: 'username email', // Include only specific fields from the user document
        })
        .select("id_creator is_user_owned start_time end_time schedule_type _id")
        .lean();
    
    return res.status(201).json({groups : schedulesGroup, individuals : individualMemberSchedule})

})

module.exports = {
    LeaveGroup,
    CreateGroup,
    JoinGroup,
    ListGroupUser,
    GenerateCode,
    DetailGroup,
    GetScheduleGroup,
    DetailAnggotaGroup
}