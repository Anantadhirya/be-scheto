const { check, validationResult, param, query, body } = require('express-validator');

const { allowed_gender} = require("../utils/const_var")

const validatePatchProfile = [
    body('firstName')
        .optional()
        .isLength({min: 1, max: 100}).withMessage("firstname name have a maximum of 100 letter"),
    body('lastName')
        .optional()
        .isLength({min: 1, max: 100}).withMessage("last name have a maximum of 100 letter"),
    body('email')
        .optional()
        .isEmail().withMessage("email is not valid"),
    body('address')
        .optional()
        .isLength({min: 1, max: 200}).withMessage("address have a maximum of 200 letter"),
    body('phoneNumber')
        .optional()
        .isLength({min: 1, max: 20}).withMessage("phone number have a maximum of 20 letter"),
    body('gender')
        .optional()
        .isString().withMessage('gender have to be a string input')
        .toLowerCase()
        .custom((value, {req}) => {
            if(allowed_gender.includes(value) ) {
                return true
            } else {
                throw new Error('gender not valid')
            }
        }),


]

module.exports = {
    validatePatchProfile
}