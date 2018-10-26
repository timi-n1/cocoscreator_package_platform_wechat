'use strict';

let buildPath = null;

module.exports = {
    load() {
        // 当 package 被正确加载的时候执行
    },

    unload() {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'run'() {
            if (!buildPath) {
                Editor.error('请先至少执行一次构建!');
                return;
            }
            require('./local-res-manager/index')(buildPath, () => {
                require('./ttffix')(buildPath, () => {
                    require('./compress')(buildPath, () => {
                        require('./work')(buildPath);
                    });
                });
            })
        },
        'codecount'() {
            const path = require('path');
            const fs = require('fs');
            const glob = require("glob");
            const extList = ['.ts', '.js', '.fire', '.prefab'];
            const basePathList = [
                path.resolve(Editor.projectInfo.path, './assets'),
                path.resolve(Editor.projectInfo.path, './plugins'),
                path.resolve(Editor.projectInfo.path, './subContext')
            ];
            const getLines = function (file) {
                let txt = fs.readFileSync(file).toString();
                let lines = txt.split('\n');
                return lines.length;
            };
            let totalcount = 0;
            const noCache = {};
            basePathList.forEach((basepath) => {
                const list = glob.sync(`${basepath}/**/*`, {});
                list.forEach((dir) => {
                    const stat = fs.statSync(dir);
                    const ext = path.extname(dir);
                    if (stat.isFile()) {
                        if (extList.includes(ext)) {
                            totalcount += getLines(dir);
                        }
                        else {
                            noCache[ext] = true;
                        }
                    }
                });
            });
            Editor.log('总代码量约为' + totalcount + '行');
        },
        'editor:build-start'(evt, data) {
            //Editor.warn('editor build start', evt, data);
            // if ('wechatgame' == data.platform) {
                buildPath = `${data.dest}`;
                const path = require('path');
                const fs = require('fs');
                if (fs.existsSync(path.resolve(__dirname, './autobuild.txt'))) {
                    const file = path.resolve(Editor.projectInfo.path, `./assets/lib/const-manager.js`);
                    const txt = fs.readFileSync(file).toString();
                    const build = parseInt(txt.match(/\"BUILD\"\:\s\"(\d+)\"/)[1], 10) + 1;
                    const newtxt = txt.replace(/\"BUILD\"\:\s\"\d+\"/, `"BUILD": "${build}"`)
                    Editor.success('build=' + build);
                    fs.writeFileSync(file, newtxt);
                }
            // }

        }
    },
};