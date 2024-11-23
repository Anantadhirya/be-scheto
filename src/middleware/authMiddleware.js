require("dotenv").config();
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const cookieConfig = require("../config/cookieConfig")

const User = require("../models/User")

const { check, validationResult, param, query, body } = require('express-validator');

const validateRegister = [
    body('username')
        .notEmpty().withMessage("username cannot be empty")
        .isLength({min: 1, max: 100}).withMessage("maximum of 100 letter"),

    body('email')
        .notEmpty().withMessage("email cannot be empty")
        .isEmail().withMessage("email is not valid"),
    body('password')
        .notEmpty().withMessage("password cannot be empty")
        .isLength({min: 8}).withMessage("minimum of 8 letter"),

]

const validateLogin = [
    body('login_detail')
        .notEmpty().withMessage("username or email cannot be empty")
    ,
    body('password')
        .notEmpty().withMessage("password cannot be empty")
]

const EnsureUser = async (req,res,next) => {
    try {
        const token = req.cookies[process.env.COOKIE_NAME];
        //console.log("JALAN", token)
        if (!token) {
            return res.status(401).json({
                error: "Token not found"
            });
        }
        const credential = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if(!credential) {
            // user tidak ditemukan
            return res.status(401).json({message : "Token not valid"})
        }
        
        // verifikasi dengan id di database
        const findUser = await User.findById(credential._id).select("-password");

        if(!findUser) {
            // user tidak ditemukan
            return res.status(401).json({message : "User is not found"})
        }

        // user ditemukan
        req.user = findUser;
        next();
    } catch (error) {
        next(error)
    }
}

module.exports = {
    EnsureUser,
    validateRegister,
    validateLogin
}