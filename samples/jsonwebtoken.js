const JWT_SIGN_SECRET = 'a';

var jwt = require('jsonwebtoken');

var payload = {
    userId: "ewEd2cOdove2tX9NCoTAMqaMxTU2",
    //exp: Math.floor(Date.now() / 1000) + (60 * 60) * 24 * 30, // 30 days expiration
}

var token = jwt.sign(payload, JWT_SIGN_SECRET);

console.log(token);

try {
    var decoded = jwt.verify(token, JWT_SIGN_SECRET);
    console.log(decoded);
} catch(err) {
    console.log(err.name);
    // TokenExpiredError
    // JsonWebTokenError
}
