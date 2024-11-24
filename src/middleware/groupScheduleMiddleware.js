const { check, validationResult, param, query, body } = require('express-validator');
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose")

const User = require("../models/User")
const Group = require("../models/Group")
const Schedule = require("../models/Schedule")

const EnsureScheduleExist = async (req,res,next) => {
    try {
        const { scheduleID, groupID } = req.params;

        const checkSchedule = await Schedule.findOne({$and : [
            { _id : scheduleID }
        ]});
        if(!checkSchedule) {
            // group doesnt exist
            return res.status(401).json({message : "Schedule not found"})
        }
        if(checkSchedule.group_data.id_group?.toString() != groupID) {
            return res.status(401).json({message : "Schedule is not accessible by group"})
        }
        const isInUserGroup = (value) => {
            return value.id_group.toString() == groupID;
        }
        if(req.user.joined_group.findIndex(isInUserGroup) == -1 && checkSchedule.id_creator.toString() != req.user._id.toString()) {
            // group doesnt exist
            return res.status(401).json({message : "Schedule cannot be accessed"})
        }
        req.schedule = checkSchedule
        
        next();
    } catch (error) {
        next(error)
    }
}

module.exports = {
    EnsureScheduleExist
}