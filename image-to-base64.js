'use strict';

var fileSystem = require('fs');
var path = require('path');
var fetch = require('node-fetch');

function validUrl(url) {
    return /http(s)?:\/\/(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?/gi.test(url);
}

function validTypeImage(image) {
    return /(?<=\S+)\.(jpg|png|jpeg)/gi.test(image);
}

function base64ToNode(buffer) {
    return buffer.toString('base64');
}

function readFileAndConvert(fileName) {
    if (fileSystem.statSync(fileName).isFile()) {
        return base64ToNode(fileSystem.readFileSync(path.resolve(fileName)).toString('base64'));
    }
    return null;
}

function isImage(urlOrImage) {
    if (validTypeImage(urlOrImage)) {
        return Promise.resolve(readFileAndConvert(urlOrImage));
    } else {
        return Promise.reject('[*] An error occured: Invalid image [validTypeImage === false]');
    }
}

function imageToBase64(urlOrImage) {
    if (validUrl(urlOrImage)) {
        let type = "image/png"
        let base64 = fetch(urlOrImage).then(function (response) {
            let imgType = response.headers.get('content-type')
            if (imgType) {
                type = imgType
            }
            return response.buffer();
        }).then(base64ToNode);

        return {
            base64,
            type,
            data: `data:${type};base64,${base64}`
        }
    } else {
        return isImage(urlOrImage);
    }
}

module.exports = imageToBase64;
