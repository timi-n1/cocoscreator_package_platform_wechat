const path = require('path');
const fs = require('fs-extra');

module.exports = function (buildPath, allDone) {

    // Editor.warn('gamejson');

    let loadingImg = 'loading.jpg';
    let gamejsonFile = path.resolve(buildPath, 'game.json');
    let pngFile = path.resolve(buildPath, loadingImg);
    let gamejson = JSON.parse( fs.readFileSync(gamejsonFile).toString() );

    gamejson.loadingImageInfo = {
        "path": loadingImg,
        "progressBarColor": "#80532C"
    };
    // gamejson.manualHideSplashScreen = true;

    fs.writeFileSync(gamejsonFile, JSON.stringify(gamejson, null, 4));
    fs.copySync( path.resolve(__dirname, `./images/${loadingImg}`), pngFile );

    // Editor.warn(path.resolve(__dirname, './images/loading.jpg'));

    allDone();
};