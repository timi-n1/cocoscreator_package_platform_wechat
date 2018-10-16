const glob = require("glob");
// const async = require('async');
const path = require('path');
const fs = require('fs-extra');

let cwd = path.resolve(__dirname, '../../build/wechatgame/res');

module.exports = function (buildPath, allDone) {
  Editor.log(buildPath)
  if (buildPath) {
    cwd = buildPath + '\/res';
  }
  Editor.log('生成资源列表');
  const extCache = {};
  let localres = ''

  glob(`${cwd}/**/*.*`, {}, function (er, files) {

    // Editor.log(cwd, files)
    files.forEach((file, index) => {

      // Editor.log(file)

      // const basename = path.basename(file).split('.')
      // const finename = basename[0]
      // const filehash = basename[1] // 直接用了 cocos 提供的 build 后的文件5位hash
      // const filetype = basename[2]
      // const dirname = path.dirname(file)

      // Editor.log(dirname)

      // const foldername = dirname.split('wechatgame/res/')[1]
      // const single = [foldername, finename, filetype, filehash]
      const single = file.split(buildPath)[1]
      const dot = index < (files.length - 1) ? ',' : '';
      localres += '\t' + JSON.stringify(single) + `${dot}\n`;
      // Editor.log(localres)
      // Editor.log(dirname)
    });
    // Editor.log(localres)

    const localResListAutoTemplate = path.resolve(Editor.projectInfo.path, './packages/wechat-cdn/local-res-manager/local-res-list-auto-template.js');
    const localResListAutoPathBackup = path.resolve(Editor.projectInfo.path, './packages/wechat-cdn/local-res-manager/local-res-list-auto.js');
    const localResListAutoPath = path.resolve(buildPath, './local-res-manager/local-res-list-auto.js');

    const templateTxt = fs.readFileSync(localResListAutoTemplate, 'utf-8').toString();
    const localResListAuto = templateTxt.replace(/"##resHoldPlace##"/, localres);

    fs.writeFileSync(localResListAutoPathBackup, localResListAuto)
    fs.outputFileSync(localResListAutoPath, localResListAuto)

  })

  const localResManagerSrcPath = path.resolve(Editor.projectInfo.path, './packages/wechat-cdn/local-res-manager/manager.js');
  const localResManagerDestPath = path.resolve(buildPath, './local-res-manager/manager.js');
  fs.copySync(localResManagerSrcPath, localResManagerDestPath)


  const modifyGameJsFile = () => {
    const gameJsPath = path.resolve(buildPath, './game.js');
    let gameJsText = fs.readFileSync(gameJsPath, 'utf-8').toString();
    if (gameJsText.indexOf("require('local-res-manager/manager')") < 0) {

      const p = gameJsText.indexOf("var Parser = require('libs/xmldom/dom-parser')")
      gameJsText = gameJsText.slice(0, p) + "require('local-res-manager/manager');\n" + gameJsText.slice(p, gameJsText.length)
      fs.outputFileSync(gameJsPath, gameJsText)
    }
  }
  modifyGameJsFile()

  allDone()

}