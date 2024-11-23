const rateLimiter = require("express-rate-limit")

const rateLimiterStandard = rateLimiter({
    message : "Terlalu banyak request, mohon tunggu sebentar",
    max : 20,
    WindowMs : 15 * 1000
})

module.exports = {
    rateLimiterStandard
}