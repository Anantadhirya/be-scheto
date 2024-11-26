const { check, validationResult, param, query, body } = require('express-validator');
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose")

const User = require("../models/User")
const Group = require("../models/Group")

const validateQueryGetSchedule = [
    query('startDate')
        .notEmpty().withMessage("start date cannot be empty")
        .isISO8601().toDate().withMessage("start date have to be date"),
    query('endDate')
        .notEmpty().withMessage("end date cannot be empty")
        .isISO8601().toDate().withMessage("end date have to be date")
]

const validateBodyCreateGroup = [
    body('group_name')
        .notEmpty().withMessage("group name cannot be empty")
        .isLength({min: 1, max: 100}).withMessage("maximum of 100 letter"),
]


const EnsureMember = async (req,res,next) => {
    try {
        const { groupID } = req.params;

        const checkGroup = await Group.findById(groupID);
        if(!checkGroup) {
            // group doesnt exist
            return res.status(401).json({message : "Group not found"})
        }

        const isInUserGroup = (value) => {
            return value.id_group.toString() == groupID
        }

        const isInMemberGroup = (value) => {
            return value.id_user.toString() ==  req.user._id.toString()
        }

        if(req.user.joined_group.findIndex(isInUserGroup) != -1 && (checkGroup.member_id.findIndex(isInMemberGroup) != -1 || checkGroup.id_leader.toString() == req.user._id.toString())) {
            // dalam grup
            req.group = checkGroup

            if(checkGroup.id_leader.toString() == req.user._id.toString()) {
                // is leader
                req.isLeader = true;
            }
        } else {
            return res.status(401).json({message : "Not a member or leader the a group"})
        }
        next();
    } catch (error) {
        next(error)
    }
}

module.exports = {
    EnsureMember,
    validateQueryGetSchedule,
    validateBodyCreateGroup
}