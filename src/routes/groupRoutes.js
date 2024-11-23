const express = require('express')
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware")


const GroupMiddleware = require("../middleware/groupMiddleware")
const GroupController = require("../controllers/groupController")

router.use(AuthMiddleware.EnsureUser)

router.patch("/id/:groupID/generate-code",  GroupMiddleware.EnsureMember, GroupController.GenerateCode) // regenerate code
router.get("/id/:groupID/schedule", GroupMiddleware.EnsureMember, GroupMiddleware.validateQueryGetSchedule, GroupController.GetScheduleGroup) // schedule of group
router.post("/id/:groupID/schedule", GroupMiddleware.EnsureMember) // post new event
router.get("/id/:groupID/detail", GroupMiddleware.EnsureMember, GroupController.DetailGroup) // group detail
router.patch("/id/:groupID/schedule/:scheduleID", GroupMiddleware.EnsureMember) // edit event
router.patch("/id/:groupID/reject/schedule/:scheduleID", GroupMiddleware.EnsureMember) // reject event
router.get("/id/:groupID/schedule/available", GroupMiddleware.EnsureMember) // find available time within specific time frame
router.delete("/leave/:groupID", GroupMiddleware.EnsureMember, GroupController.LeaveGroup) // leave group

router.patch("/join/:groupCode", GroupController.JoinGroup)
router.post("/create", GroupMiddleware.validateBodyCreateGroup, GroupController.CreateGroup)
router.get("/list", GroupController.ListGroupUser)

module.exports = router