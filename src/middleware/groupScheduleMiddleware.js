const { check, validationResult, param, query, body } = require('express-validator');
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose")

const User = require("../models/User")
const Group = require("../models/Group")
const Schedule = require("../models/Schedule")

const validateInsertSchedule = [
    body('title')
        .notEmpty().withMessage("title cannot be empty")
    ,
    body('description')
        .optional()
    ,
    body('startDate')
        .notEmpty().withMessage("start date cannot be empty")
        .isISO8601().withMessage("start date have to be valid date")
    ,
    body('endDate')
        .notEmpty().withMessage("end date cannot be empty")
        .isISO8601().withMessage("end date have to be valid date")
    ,
    body('member_ids')
        .optional()
        .isArray().withMessage("have to be an array of member ids")
    ,
]

const EnsureScheduleExist = async (req,res,next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
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
    EnsureScheduleExist,
    validateInsertSchedule
}