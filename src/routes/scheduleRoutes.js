const express = require('express')
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware")

const ScheduleController = require("../controllers/scheduleController")
const ScheduleMiddleware = require("../middleware/scheduleMiddleware")

router.use(AuthMiddleware.EnsureUser)

router.get('/list', ScheduleMiddleware.validateGetSchedule,ScheduleController.GetSchedule) // get all of our schedule including group event
router.patch('/individual/:scheduleID', ScheduleMiddleware.validateInsertSchedule,ScheduleMiddleware.EnsureScheduleExist, ScheduleController.UpdateScheduleDetail) // patch individual schedule
router.delete('/individual/:scheduleID', ScheduleMiddleware.validateDelete, ScheduleMiddleware.EnsureScheduleExist, ScheduleController.DeleteSchedule) // delete individual schedule
router.get('/individual/:scheduleID', ScheduleMiddleware.EnsureScheduleExist, ScheduleController.GetScheduleDetail) // certain individual schedule
router.post('/individual', ScheduleMiddleware.validateInsertSchedule,ScheduleController.PostNewSchedule) // post individual schedule

module.exports = router