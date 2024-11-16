const express = require('express')
const router = express.Router();
const AuthController = require("../controllers/authController")
const AuthMiddleware = require("../middleware/authMiddleware")

router.post("/login", AuthMiddleware.validateLogin, AuthController.LoginHandler)
router.patch("/password", AuthMiddleware.EnsureUser, AuthController.ChangePasswordHandler)
router.patch("/logout", AuthController.LogoutHandler)
router.post("/register", AuthMiddleware.validateRegister, AuthController.RegisterHandler)
router.get("/verify", AuthMiddleware.EnsureUser, (req,res,next) => res.status(201).json({message : "User verified"}))

module.exports = router