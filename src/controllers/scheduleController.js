const asyncHandler = require("express-async-handler");
const { validationResult } = require('express-validator');
const mongoose = require("mongoose")
const { isBefore, isAfter, parseISO, getDate, getDay, format, differenceInMinutes } = require("date-fns");


const User = require("../models/User")
const Group = require("../models/Group")
const Schedule = require("../models/Schedule")

const scheduleUtils = require("../utils/schedule")

/**
    POST /schedule/individu
    buat schedule
    body : {
        title,
        description,
        startDate,
        endDate,
        recurrence,
        isPrivate
    }
*/
const PostNewSchedule = asyncHandler(async (req,res,next) => {
    const { title, description, startDate, endDate, recurrence, isPrivate } = req.body;
    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isAfter(start, end)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
    }
    if (!["NONE", "DAILY", "WEEKLY", "MONTHLY"].includes(recurrence)) {
        return res.status(400).json({ message: "Invalid recurrence type" });
    }

    const durationInMinutes = differenceInMinutes(end, start)
    const dayName = format(start, "EEEE");
    const dayOfMonth = getDate(start);

    const newSchedule =  await Schedule.create({
        is_user_owned : true,
        id_creator : req.user._id,
        title : title,
        description : description,
        duration : durationInMinutes,
        schedule_type : recurrence,
        start_time : startDate,
        end_time : endDate,
        is_private : isPrivate,
        recurrence : {
            daily: {
                enabled: recurrence == "DAILY",
            },
            weekly: {
                enabled: recurrence == "WEEKLY",
                days_of_week: dayName,
            },
            monthly: {
                enabled: recurrence == "MONTHLY",
                dates: dayOfMonth,
            },
        }
    })

    return res.status(201).json({schedule : newSchedule.toObject(), message : "Schedule succesfully created"});
})  


/**
    GET /schedule/list
    query : {
        startDate,
        endDate,
        is_all
    }
    Get jadwal berdasarkan rentang tertentu milik individu
*/
const GetSchedule = asyncHandler(async (req,res,next) => {
    const { startDate, endDate, is_all } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        return res.status(400).json({ message: "startDate cannot be after endDate." });
    }

    const schedules = await Schedule.find({
        $or: [
            { id_creator: req.user._id, is_user_owned: true }, // User is the creator
            { "group_data.member_joining": { $in : [req.user._id]} },    // User is in the group
        ],
    }).lean();

    // Filter by date range
    const filteredSchedules = schedules.filter((schedule) => {
        const recurrence = schedule.recurrence;

        if (recurrence.daily.enabled) {
            return true;
        }

        if (recurrence.weekly.enabled) {
            return true;
        }

        if (recurrence.monthly.enabled) {
            return true;
        }

        return is_all == "true" ? true : schedule.start_time >= start && schedule.end_time <= end;
    });

    return res.status(200).json({schedules : filteredSchedules})
}) 

/**
    DELETE /schedule/individual/:scheduleID
    delete jadwal individu
*/
const DeleteSchedule = asyncHandler(async(req,res,next) => {
    const { scheduleID } = req.params;
    if(req.schedule.id_creator.toString() != req.user._id.toString()) {
        return res.status(401).json({message : "You cannot delete this schedule"})
    }
    await Schedule.findByIdAndDelete(scheduleID);

    return res.status(200).json({message : "Schedule have been deleted"})

})

/**
    GET /schedule/individual/:scheduleID
    delete jadwal individu
*/
const GetScheduleDetail = asyncHandler(async(req,res,next) => {
    const { scheduleID } = req.params;
    const checkSchedule = await Schedule.findById(scheduleID)
        .populate('id_creator', 'username email _id') // Populate `id_creator` with specific fields
        .populate({
            path: 'group_data.member_joining',
            select: 'username email _id', // Only select the `name` and `email` fields
        })
        .populate({
            path: 'group_data.member_rejected',
            select: 'username email _id', // Only select the `name` and `email` fields
        })
        .populate('group_data.id_group', 'group_name') // Populate `id_group` with specific fields
        .lean();

    return res.status(200).json({ schedule : checkSchedule})

})


/**
    PATCH /schedule/individual/:scheduleID
    update schedule
    body : {
        title,
        description,
        startDate,
        endDate,
        recurrence,
        isPrivate,
        repeat_until
    }
*/
const UpdateScheduleDetail = asyncHandler(async(req,res,next) => {
    const { title, description, startDate, endDate, recurrence, isPrivate, repeatUntil } = req.body;

    if(req.schedule.id_creator.toString() != req.user._id.toString()) {
        return res.status(401).json({message : "You cannot edit this schedule"})
    }

    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isAfter(start, end)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
    }
    if (!["NONE", "DAILY", "WEEKLY", "MONTHLY"].includes(recurrence)) {
        return res.status(400).json({ message: "Invalid recurrence type" });
    }

    const durationInMinutes = differenceInMinutes(end, start)
    const dayName = format(start, "EEEE");
    const dayOfMonth = getDate(start);

    req.schedule.title = title;
    req.schedule.description = description;
    req.schedule.start_date = startDate;
    req.schedule.end_date = endDate;
    req.schedule.is_private = isPrivate;
    if(repeatUntil) {
        req.schedule.repeat_until = repeatUntil;
    }
    req.schedule.duration = durationInMinutes;
    
    switch(recurrence){
        case "DAILY":
            req.schedule.schedule_type = recurrence;
            req.schedule.recurrence.daily = true;
            req.schedule.recurrence.weekly.enabled = false;
            req.schedule.recurrence.monthly.enabled = false;
            break;
        case "MONTHLY":
            req.schedule.recurrence.daily = false;
            req.schedule.recurrence.weekly.enabled = false;
            req.schedule.recurrence.monthly.enabled = true;
            req.schedule.recurrence.monthly.dates = dayOfMonth;
            break;
        case "NONE":
            req.schedule.schedule_type = recurrence;
            req.schedule.recurrence.daily = false;
            req.schedule.recurrence.weekly.enabled = false;
            req.schedule.recurrence.monthly.enabled = false;
            break;
        case "WEEKLY":
            req.schedule.schedule_type = recurrence;
            req.schedule.recurrence.daily = false;
            req.schedule.recurrence.weekly.enabled = true;
            req.schedule.recurrence.weekly.days_of_week = dayName;
            req.schedule.recurrence.monthly.enabled = false;
            break;
        default:
            break;
    }

    await req.schedule.save();

    return res.status(201).json({schedule : req.schedule.toObject(), message : "Schedule succesfully created"});

})


module.exports = {
    PostNewSchedule,
    GetSchedule,
    GetScheduleDetail,
    DeleteSchedule,
    UpdateScheduleDetail
}