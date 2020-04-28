#!/usr/bin/env node

const otplib = require('otplib')
const clipboardy = require('clipboardy');



const secret = '';
// Alternatively: const secret = otplib.authenticator.generateSecret();

const token = otplib.authenticator.generate(secret);

try {
    const isValid = otplib.authenticator.check(token, secret);
    if (isValid)
    {
        console.log(token)
        clipboardy.writeSync(token);
    }
    // or
    // const isValid = otplib.authenticator.verify({ token, secret });
} catch (err) {
    // Error possibly thrown by the thirty-two package
    // 'Invalid input - it is not base32 encoded string'
    console.error(err);
}
