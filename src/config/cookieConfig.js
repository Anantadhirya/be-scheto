const cookieConfig = {
    maxAge : 1000 * 60 * 60 * 24,
    httpOnly : true,
    secure : process.env.environment == "development" ? false : true,
    sameSite : process.env.environment == "development" ?'lax' : 'lax',
    domain : process.env.FE_DOMAIN,
}

module.exports = cookieConfig