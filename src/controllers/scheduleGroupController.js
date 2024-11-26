const asyncHandler = require("express-async-handler");
const { validationResult } = require('express-validator');
const mongoose = require("mongoose")
const { isBefore, isAfter, parseISO, getDate, getDay, format, differenceInMinutes } = require("date-fns");


const User = require("../models/User")
const Group = require("../models/Group")
const Schedule = require("../models/Schedule")
const Inbox = require("../models/Inbox")

/**
    POST group/id/:groupID/schedule
    buat schedule
    body : {
        title,
        description,
        startDate,
        endDate,
        member_ids:[]
    }
*/
const PostNewSchedule = asyncHandler(async (req,res,next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    
    const { title, description, startDate, endDate, member_ids } = req.body;
    const { groupID } = req.params
    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isAfter(start, end)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const durationInMinutes = differenceInMinutes(end, start)
    const dayName = format(start, "EEEE");
    const dayOfMonth = getDate(start);

    const session = await mongoose.startSession();
    let newSchedule;
    let populateNewSchedule;
    try {
        
        session.startTransaction()

        newSchedule =  await Schedule.create([{
            is_user_owned : false,
            id_creator : req.user._id,
            title : title,
            description : description,
            duration : durationInMinutes,
            schedule_type : "NONE",
            start_time : startDate,
            end_time : endDate,
            is_private : false,
            recurrence : {
                daily: {
                    enabled: false,
                },
                weekly: {
                    enabled: false,
                    days_of_week: dayName,
                },
                monthly: {
                    enabled: false,
                    dates: dayOfMonth,
                },
            },
            group_data : {
                member_joining : member_ids,
                member_rejected : [],
                id_group : groupID
            },
        }], {
            session : session
        })
        populateNewSchedule = await Schedule.findById(newSchedule[0]._id)
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
        .session(session)

        const insertManyInbox = member_ids.map((value) => {
            return {
                for_group_id : groupID,
                for_user_id : value,
                message : `You have been invited by ${req.user.username} to "${newSchedule[0].title}"`,
                is_for_individual : true,
                title : `${newSchedule[0].title} Invitation`
            }
        })

        // send inbox
        await Inbox.insertMany(insertManyInbox, {
            session : session,
        });
        
        await session.commitTransaction();
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }

    return res.status(201).json({schedule : populateNewSchedule.toObject(), message : "Group Schedule succesfully created"});
})  

/**
    DELETE group/id/:groupID/schedule/:scheduleID
    delete jadwal grup
*/
const DeleteSchedule = asyncHandler(async(req,res,next) => {
    const { scheduleID, groupID } = req.params;
    if(req.schedule.id_creator.toString() != req.user._id.toString()) {
        return res.status(401).json({message : "You cannot delete this schedule"})
    }
    const session = await mongoose.startSession();
    try {
        
        session.startTransaction()

        await Schedule.findByIdAndDelete(scheduleID, { session : session});

        const insertManyInbox = req.schedule.group_data.member_joining?.map((value) => {
            return {
                for_group_id : groupID,
                for_user_id : value,
                message : `Event "${req.schedule.title}" has been deleted by ${req.user.username}`,
                is_for_individual : true,
                title : `${req.schedule.title} Cancelled`
            }
        })

        // send inbox
        await Inbox.insertMany(insertManyInbox, {
            session : session,
        });
        
        await session.commitTransaction();
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
    

    return res.status(200).json({message : "Schedule have been deleted"})

})

/**
    GET group/id/:groupID/schedule/:scheduleID
    get detail schedule
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
    PATCH group/id/:groupID/schedule/:scheduleID
    update schedule
    body : {
        title,
        description,
        startDate,
        endDate,
        member_ids:[]
    }
*/
const UpdateScheduleDetail = asyncHandler(async(req,res,next) => {
    const { title, description, startDate, endDate, member_ids } = req.body;
    const { groupID } = req.params
    if(req.schedule.id_creator.toString() != req.user._id.toString()) {
        return res.status(401).json({message : "You cannot edit this schedule"})
    }

    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isAfter(start, end)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const durationInMinutes = differenceInMinutes(end, start)
    const dayName = format(start, "EEEE");
    const dayOfMonth = getDate(start);
    //console.log(dayOfMonth)

    req.schedule.title = title;
    req.schedule.description = description;
    req.schedule.start_date = startDate;
    req.schedule.end_date = endDate;
    req.schedule.duration = durationInMinutes;
    req.schedule.recurrence.monthly.dates = dayOfMonth
    req.schedule.recurrence.weekly.days_of_week = dayName
    
    const newMember = req.schedule.group_data.member_joining?.filter((value) => {
        return !member_ids.includes(value.toString())
    })
    const filterOutRejected = req.schedule.group_data.member_rejected?.filter((value) => {
        return !member_ids.includes(value.toString())
    })
    req.schedule.group_data.member_joining = [...newMember, ...member_ids]
    req.schedule.group_data.member_rejected = [...filterOutRejected]

    const session = await mongoose.startSession();
    try {
        
        session.startTransaction()

        await req.schedule.save({session : session});

        const insertManyInbox = req.schedule.group_data.member_joining?.map((value) => {
            return {
                for_group_id : groupID,
                for_user_id : value,
                message : `Event "${req.schedule.title}" has been updated by ${req.user.username}`,
                is_for_individual : true,
                title : `${req.schedule.title} Updated`
            }
        })

        // send inbox
        await Inbox.insertMany(insertManyInbox, {
            session : session,
        });
        
        await session.commitTransaction();
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }

    

    return res.status(201).json({schedule : req.schedule.toObject(), message : "Schedule succesfully created"});

})

/**
    PATCH group/id/:groupID/schedule/reject/:scheduleID
    reject schedule invitation
*/
const RejectGroupEvent = asyncHandler(async(req,res,next) => {
    const filteredMemberJoining = req.schedule.group_data.member_joining.filter((value) => {
        return value.toString() != req.user._id.toString();
    })

    req.schedule.group_data.member_joining = filteredMemberJoining
    const filterOutRejected = req.schedule.group_data.member_rejected?.filter((value) => {
        return value.toString() != req.user._id.toString();
    })
    filterOutRejected.push(req.user._id)
    req.schedule.group_data.member_rejected = filterOutRejected;

    const session = await mongoose.startSession();
    try {
        
        session.startTransaction()
        await req.schedule.save({session : session});

        // send inbox
        await Inbox.create([{
            for_group_id : req.schedule.group_data.id_group,
            for_user_id : req.schedule.id_creator,
            message : `${req.user.username} rejected the event "${req.schedule.title}"`,
            is_for_individual : false,
            title : `"${req.schedule.title}" Rejected`
        }], {
            session : session,
        });
        
        await session.commitTransaction();
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }

    return res.status(201).json({schedule : req.schedule.toObject(), message : "Schedule has been rejected"});

})

module.exports = {
    PostNewSchedule,
    DeleteSchedule,
    GetScheduleDetail,
    UpdateScheduleDetail,
    RejectGroupEvent
}