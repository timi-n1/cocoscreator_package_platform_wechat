const glob = require("glob");
const os = require('os');
const async = require('async');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const compressFunc = {};

module.exports = function (buildPath, allDone) {
    Editor.log('开始处理TTF路径bug');
    //先找到ttf的正确md5值
    glob(`${buildPath}/src/setting*.js`, {}, function (er, files) {
        if( files && files.length == 1 ){
            const settings = fs.readFileSync(files[0]).toString();
            const match = settings.match(/\/([0-9a-z\-]+)\/[0-9a-z]+\.ttf\"\:\"([0-9a-z]+)\"/i);
            const sha = match[1];
            const md5 = match[2];
            Editor.warn(`找到了sha=${sha}, md5=${md5}`);
            //查找rawfile字段
            glob(`${buildPath}/res/import/**/${sha}.*.json`, {}, function (er, _files) {
                if( _files && _files.length == 1 ){
                    let cfg = fs.readFileSync(_files[0]).toString();
                    cfg = cfg.replace(`.ttf"`, `.${md5}.ttf"`);
                    fs.writeFileSync(_files[0], cfg);
                    Editor.warn(`rawFiles更新为${cfg}`);
                    allDone();
                }
            });
        }
    })
};