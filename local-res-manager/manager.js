var wx = window['wx'];
var fs = wx.getFileSystemManager();
var localResList = require('./local-res-list-auto');
var LocalResManager = /** @class */ (function () {
    function LocalResManager() {
        this.resPath = wx.env.USER_DATA_PATH + "/res";
        // console.warn(wx.env.USER_DATA_PATH)
        console.log("正在检查文件列表");
        this.checkFiles(wx.env.USER_DATA_PATH + "/res");
    }
    LocalResManager.prototype.checkFiles = function (filePath) {
        try {
            var files = fs.readdirSync(filePath) || [];
            // console.warn('files', files)
            if (files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var currentFilePath = filePath + "/" + file;
                    // console.warn('currentFile',currentFilePath)
                    var state = fs.statSync(currentFilePath);
                    if (state.isFile()) {
                        // console.warn('localResList', localResList)
                        var modifiedPath = currentFilePath.split("" + wx.env.USER_DATA_PATH)[1].trim();
                        // console.warn('modifiedPath', modifiedPath)
                        // console.warn(localResList.includes(modifiedPath))
                        if (localResList.includes(modifiedPath)) {
                        }
                        else {
                            try {
                                console.log('正在删除文件', currentFilePath);
                                fs.unlinkSync(currentFilePath);
                            }
                            catch (err) {
                                console.log(err);
                            }
                        }
                    }
                    else {
                        this.checkFiles(currentFilePath);
                    }
                }
            }
        }
        catch (error) {
            return console.log(error);
        }
    };
    //确保res目录存在
    LocalResManager.prototype.ensureResPath = function () {
        try {
            fs.accessSync(this.resPath);
        }
        catch (err) {
            console.warn(err);
            return false;
        }
    };
    LocalResManager.prototype.writeFileSync = function (filePath, data, encoding) {
        fs.writeFileSync(filePath, data, encoding);
    };
    return LocalResManager;
}());
module.exports = new LocalResManager();
