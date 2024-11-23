const express = require('express')
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware")



router.get("/list", AuthMiddleware.EnsureUser)
router.get("/generate-code", AuthMiddleware.EnsureUser)


router.get("/id/", AuthMiddleware.EnsureUser)

router.get("/join", AuthMiddleware.EnsureUser)
router.get("/leave", AuthMiddleware.EnsureUser)
router.get("/create", AuthMiddleware.EnsureUser)


module.exports = router