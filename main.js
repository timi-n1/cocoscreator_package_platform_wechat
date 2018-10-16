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
        'config_xlsx'() {
            require('./excel/excel')();
        },
        'config_furniture_position'() {
            require('./yardconfig/index')('furniture');
        },
        'config_cats_position'() {
            require('./yardconfig/index')('cats');
        },
        'config_toys_position'() {
            require('./yardconfig/index')('toys');
        },
        'spine_maker'() {
            require('./cats_alive/spine')();
        },
        'spine_texture_maker'() {
            require('./cats_alive/spine_texture')();
        },
        'furniture_texture_maker'() {
            require('./furniture/furniture_texture')();
        },
        'toys_texture_maker'() {
            require('./toys/toys_maker')();
        },
        'food_texture_maker'() {
            require('./food/food_maker')();
        },
        'cats_category_maker'() {
            require('./cats_category/cats_category')();
        },
        'editor:build-start'(evt, data) {
            //Editor.warn('editor build start', evt, data);
            if ('wechatgame' == data.platform) {
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
            }

        }
        // 'editor:build-finished'(evt, data){
        //     buildPath = `${data.dest}`;
        //     require('./work')(buildPath);
        // }
    },
};