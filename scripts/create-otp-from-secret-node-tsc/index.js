#!/usr/bin/env node
var otplib = require('otplib');
var clipboardy = require('clipboardy');
// add your secret here
var secret = '';
var token = otplib.authenticator.generate(secret);
try {
    var isValid = otplib.authenticator.check(token, secret);
    if (isValid) {
        console.log(token);
        clipboardy.writeSync(token);
    }
}
catch (err) {
    console.error(err);
}
