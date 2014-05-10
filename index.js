/*
    Copyright (c) 2014 Bastien Clément

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var fs = require("fs");
var path = require("path");

function resolveDirs(p, opts) {
    var dirs = [];

    var dir = p;
    while(dir !== ".") {
        dirs.push(dir);
        dir = path.dirname(dir);
    }

    // Explicit './'
    if(/^\.[\\\/]/.test(p)) {
        dirs.push(".");
    }

    return dirs.map(function(dir) {
        return path.join(opts.root, dir);
    });
}

module.exports = function rmdirp(p, opts, cb) {
    if(typeof opts === "function") {
        cb = opts;
        opts = {};
    }

    if(!opts) opts = {};
    if(!opts.root) opts.root = ".";

    var dirs = resolveDirs(p, opts);
    var xfs = opts.fs || fs;

    function next(err) {
        var dir = dirs.shift();
        if(!dir) return cb(null);
        xfs.rmdir(dir, function(err) {
            if(err && (!dirs.length || err.code !== "ENOENT"))
                return cb(err);
            next();
        });
    };

    next();
};

module.exports.sync = function(p, opts) {
    if(!opts) opts = {};
    if(!opts.root) opts.root = ".";

    var dirs = resolveDirs(p, opts);
    var xfs = opts.fs || fs;

    var dir;
    while(dir = dirs.shift()) {
        try {
            xfs.rmdirSync(dir);
        } catch(err) {
            if(!dirs.length || err.code !== "ENOENT") {
                throw err;
            }
        }
    }
}
