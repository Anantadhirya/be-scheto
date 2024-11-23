const { check, validationResult, param, query, body } = require('express-validator');

const { allowed_gender} = require("../utils/const_var")

const validatePatchProfile = [
    body('firstName')
        .optional()
        .isLength({min: 1, max: 100}).withMessage("maximum of 100 letter"),
    body('lastName')
        .optional()
        .isLength({min: 1, max: 100}).withMessage("maximum of 100 letter"),
    body('email')
        .optional()
        .isEmail().withMessage("email is not valid"),
    body('address')
        .optional()
        .isLength({min: 1, max: 100}).withMessage("maximum of 200 letter"),
    body('phoneNumber')
        .optional()
        .isLength({min: 1, max: 20}).withMessage("maximum of 20 letter"),
    body('gender')
        .optional()
        .custom((value, {req}) => {
            if(allowed_gender.includes(value) ) {
                return true
            } else {
                throw new Error('gender not valid')
            }
        }),
    body('address')
        .optional()
        .isLength({min: 1, max: 100}).withMessage("maximum of 200 letter"),


]

module.exports = {
    validatePatchProfile
}