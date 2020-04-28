#!/usr/bin/env node

const otplib = require('otplib')
const clipboardy = require('clipboardy');

// add your secret here
const secret = '';


const token = otplib.authenticator.generate(secret);

try {
    const isValid = otplib.authenticator.check(token, secret);
    if (isValid)
    {
        console.log(token)
        clipboardy.writeSync(token);
    }
} catch (err) {
    console.error(err);
}
