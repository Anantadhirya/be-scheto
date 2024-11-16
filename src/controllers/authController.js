const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const cookieConfig = require("../config/cookieConfig")
const bycrypt = require("bcrypt")
const { validationResult } = require('express-validator');

const User = require("../models/User")


/**
    POST /auth/login
    Login handler
    req : username or email, password
*/
const LoginHandler = asyncHandler(async (req,res,next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { login_detail, password } = req.body;
    const findUser = await User.findOne({$or: 
        [
            { email: login_detail },
            { username: login_detail }
        ]
    })
    if(!findUser) {
        return res.status(400).json({message : "username or password is not correct"})
    }

    // cek password
    const passwordMatch = await bycrypt.compare(password, findUser.password);

    if(!passwordMatch) {
        // password salah
        return res.status(400).json({message : "username or password is not correct"})
    }

    // password dan username benar 
    const encodedJWT = await jwt.sign(
        {
            email : findUser.email,
            username : findUser.username,
            _id : findUser._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn : "24h",
        }
    )
    // kasih cookie
    res.cookie(process.env.COOKIE_NAME, encodedJWT, cookieConfig)

    return res.status(201).json({
        message : "login successful"
    })
})

/**
    POST /auth/register
    Register handler
    req : username or email, password
*/
const RegisterHandler = asyncHandler(async (req,res,next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email,password } = req.body;
    // cek jika violate unique
    const findAlreadyExist = await User.find({$or: 
        [
            { email: email },
            { username: username }
        ]
    })

    if(findAlreadyExist?.length > 0) {
        return res.status(400).json({message : "Username or email already exist"})
    }

    // hash password
    const saltRound = 10;
    const hashPassword = await bycrypt.hash(password, saltRound)

    // bikin akun
    const newUser = new User({
        "email" : email,
        "username" : username,
        "password" : hashPassword
    })

    await newUser.save();

    return res.status(201).json({message : "account has been created"})
})

/**
    PATCH /auth/logout
    Logout handler
*/
const LogoutHandler = asyncHandler(async (req,res,next) => {
    res.clearCookie(process.env.COOKIE_NAME, {...cookieConfig, maxAge : 0})
    return res.status(201).json({message : "logout successful"})
})

/**
    PATCH /auth/password
    Change password handler
    req : newPass
*/
const ChangePasswordHandler = asyncHandler(async (req,res,next) => {
    
})


module.exports = {
    LoginHandler,
    ChangePasswordHandler,
    LogoutHandler,
    RegisterHandler
}