#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var otplib = require("otplib");
var clipboardy = require('clipboardy');
var secret = '';
// Alternatively: const secret = otplib.authenticator.generateSecret();
var token = otplib.authenticator.generate(secret);
try {
    var isValid = otplib.authenticator.check(token, secret);
    if (isValid) {
        console.log(token);
        clipboardy.writeSync(token);
    }
    // or
    // const isValid = otplib.authenticator.verify({ token, secret });
}
catch (err) {
    // Error possibly thrown by the thirty-two package
    // 'Invalid input - it is not base32 encoded string'
    console.error(err);
}
