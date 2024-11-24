const express = require('express')
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware")


const GroupMiddleware = require("../middleware/groupMiddleware")
const GroupController = require("../controllers/groupController")
const GroupScheduleController = require("../controllers/scheduleGroupController")
const GroupScheduleMiddleware = require("../middleware/groupScheduleMiddleware")


router.use(AuthMiddleware.EnsureUser)

router.get("/id/:groupID/schedule", GroupMiddleware.EnsureMember, GroupMiddleware.validateQueryGetSchedule, GroupController.GetScheduleGroup) // schedule of group
router.post("/id/:groupID/schedule", GroupMiddleware.EnsureMember, GroupScheduleController.PostNewSchedule) // post new event
router.get("/id/:groupID/schedule/:scheduleID", GroupMiddleware.EnsureMember, GroupScheduleMiddleware.EnsureScheduleExist, GroupScheduleController.GetScheduleDetail) // get group event
router.patch("/id/:groupID/schedule/:scheduleID", GroupMiddleware.EnsureMember, GroupScheduleMiddleware.EnsureScheduleExist, GroupScheduleController.UpdateScheduleDetail) // edit event
router.delete("/id/:groupID/schedule/:scheduleID", GroupMiddleware.EnsureMember, GroupScheduleMiddleware.EnsureScheduleExist, GroupScheduleController.DeleteSchedule) // delete event
router.patch("/id/:groupID/schedule/reject/:scheduleID", GroupMiddleware.EnsureMember, GroupScheduleMiddleware.EnsureScheduleExist, GroupScheduleController.RejectGroupEvent) // reject event
router.get("/id/:groupID/schedule/available", GroupMiddleware.EnsureMember) // find available time within specific time frame

router.patch("/id/:groupID/generate-code",  GroupMiddleware.EnsureMember, GroupController.GenerateCode) // regenerate code
router.get("/id/:groupID/detail", GroupMiddleware.EnsureMember, GroupController.DetailGroup) // group detail
router.patch("/id/:groupID/description", GroupMiddleware.EnsureMember, GroupController.UpdateDescription) // group detail
router.get("/id/:groupID/member", GroupMiddleware.EnsureMember, GroupController.DetailAnggotaGroup) // get all of member detail

router.delete("/leave/:groupID", GroupMiddleware.EnsureMember, GroupController.LeaveGroup) // leave group

router.patch("/join", GroupController.JoinGroup)
router.post("/create", GroupMiddleware.validateBodyCreateGroup, GroupController.CreateGroup)
router.get("/list", GroupController.ListGroupUser)

module.exports = router