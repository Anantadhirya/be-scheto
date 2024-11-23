const express = require('express')
const router = express.Router();
const AuthMiddleware = require("../middleware/authMiddleware")

const ProfileMiddleware = require("../middleware/profileMiddleware")
const ProfileController = require("../controllers/profileController")



router.get("/inbox", AuthMiddleware.EnsureUser, ProfileController.GetUserInboxByNewest)
router.get("/detail", AuthMiddleware.EnsureUser, ProfileController.GetProfileDetail)
router.patch("/detail", AuthMiddleware.EnsureUser, ProfileMiddleware.validatePatchProfile, ProfileController.PatchProfileUser)

module.exports = router