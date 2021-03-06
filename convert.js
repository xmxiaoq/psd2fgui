#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const globby_1 = __importDefault(require("globby"));
var psd2fgui = require("./lib.js");
async function run(argv) {
    if (argv.length == 0) {
        console.info('Usage: psd2fgui psdFile [outputFile] [--nopack] [--ignore-font] [#buildId]');
        process.exit(0);
    }
    var psdFile = argv[0];
    var outputFile;
    var option = 0;
    var buildId;
    for (var i = 1; i < argv.length; i++) {
        var arg = argv[i];
        if (arg.indexOf('--') == 0) {
            switch (arg.substr(2)) {
                case 'nopack':
                    option |= psd2fgui.constants.NO_PACK;
                    break;
                case 'ignore-font':
                    option |= psd2fgui.constants.IGNORE_FONT;
                    break;
                default:
                    console.error('unknown argument: ' + arg);
                    process.exit(1);
                    break;
            }
        }
        else if (arg.substr(0, 1) == '#') {
            buildId = arg.substr(1);
        }
        else {
            if (!outputFile)
                outputFile = arg;
            else {
                console.error('unknown argument: ' + arg);
                process.exit(1);
            }
        }
    }
    const st = fs_extra_1.default.statSync(psdFile);
    if (st.isFile()) {
        const file = psdFile;
        try {
            const buildID = await psd2fgui.convert(file, outputFile, option, buildId);
            // console.log(`file:`, file, 'buildId: ' + buildID);
        }
        catch (e) {
            console.error(`file:`, file, e);
        }
    }
    else {
        let files;
        if (st.isDirectory()) {
            files = globby_1.default.sync(`**/*.psd`, { onlyFiles: true, unique: true, absolute: true, cwd: psdFile });
        }
        else {
            files = globby_1.default.sync(psdFile, { onlyFiles: true, unique: true, absolute: true });
        }
        for (let file of files) {
            try {
                const buildID = await psd2fgui.convert(file, outputFile, option, buildId);
                // console.log(`file:`, file, 'buildId: ' + buildID);
            }
            catch (e) {
                console.error(`file:`, file, e);
            }
        }
    }
}
run(process.argv.slice(2));
