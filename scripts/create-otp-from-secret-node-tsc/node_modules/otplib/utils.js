/**
 * otplib-utils
 *
 * @author Gerald Yeo <contact@fusedthought.com>
 * @version: 11.0.1
 * @license: MIT
 **/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function hexToInt(hex) {
  return parseInt(hex, 16);
}

function intToHex(value) {
  return parseInt(value, 10).toString(16);
}

function isValidToken(value) {
  return /^(\d+)(\.\d+)?$/.test(value);
}

function isSameToken(token1, token2) {
  if (isValidToken(token1) && isValidToken(token2)) {
    return String(token1) === String(token2);
  }

  return false;
}

function leftPad(value, length) {
  var total = !length ? 0 : length;
  var padded = value + '';

  while (padded.length < total) {
    padded = '0' + padded;
  }

  return padded;
}

function padSecret(secretBuffer, size, encoding) {
  var secret = secretBuffer.toString(encoding);
  var len = secret.length;

  if (size && len < size) {
    var newSecret = new Array(size - len + 1).join(secretBuffer.toString('hex'));
    return Buffer.from(newSecret, 'hex').slice(0, size);
  }

  return secretBuffer;
}

function removeSpaces() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (value == null) {
    return '';
  }

  return value.replace(/\s+/g, '');
}

function secretKey(length) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!length || length < 1) {
    return '';
  }

  if (!options.crypto || typeof options.crypto.randomBytes !== 'function') {
    throw new Error('Expecting options.crypto to have a randomBytes function');
  }

  return options.crypto.randomBytes(length).toString('base64').slice(0, length);
}

function setsOf(value) {
  var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
  var divider = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ' ';
  var num = parseInt(amount, 10);

  if (Number.isNaN(num) || typeof value !== 'string') {
    return '';
  }

  var regex = new RegExp('.{1,' + amount + '}', 'g');
  return value.match(regex).join(divider);
}

function stringToHex(value) {
  var val = value == null ? '' : value;
  var hex = '';
  var tmp = '';

  for (var i = 0; i < val.length; i++) {
    tmp = ('0000' + val.charCodeAt(i).toString(16)).slice(-2);
    hex += '' + tmp;
  }

  return hex;
}

exports.hexToInt = hexToInt;
exports.intToHex = intToHex;
exports.isSameToken = isSameToken;
exports.leftPad = leftPad;
exports.padSecret = padSecret;
exports.removeSpaces = removeSpaces;
exports.secretKey = secretKey;
exports.setsOf = setsOf;
exports.stringToHex = stringToHex;