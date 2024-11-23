const express = require('express')
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware")

const ScheduleController = require("../controllers/scheduleController")
const ScheduleMiddleware = require("../middleware/scheduleMiddleware")

router.use(AuthMiddleware.EnsureUser)

router.get('/list', ScheduleController.GetSchedule) // get all of our schedule including group event
router.patch('/individual/:scheduleID', ScheduleMiddleware.EnsureScheduleExist, ScheduleController.UpdateScheduleDetail) // patch individual schedule
router.delete('/individual/:scheduleID', ScheduleMiddleware.EnsureScheduleExist, ScheduleController.DeleteSchedule) // delete individual schedule
router.get('/individual/:scheduleID', ScheduleMiddleware.EnsureScheduleExist, ScheduleController.GetScheduleDetail) // certain individual schedule
router.post('/individual', ScheduleController.PostNewSchedule) // post individual schedule

module.exports = router