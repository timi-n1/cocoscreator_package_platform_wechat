
const wx = window['wx']

const fs = wx.getFileSystemManager() as any;
const localResList = require('./local-res-list-auto');

class LocalResManager {

  resPath = `${wx.env.USER_DATA_PATH}/res`
  constructor() {
    // console.warn(wx.env.USER_DATA_PATH)
    console.log("正在检查文件列表")
    this.checkFiles(`${wx.env.USER_DATA_PATH}/res`)
  }

  checkFiles(filePath) {
    try {
      const files = fs.readdirSync(filePath) || []
      // console.warn('files', files)
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const currentFilePath = `${filePath}/${file}`
          // console.warn('currentFile',currentFilePath)
          const state = fs.statSync(currentFilePath)
          if (state.isFile()) {
            // console.warn('localResList', localResList)
            const modifiedPath = currentFilePath.split(`${wx.env.USER_DATA_PATH}`)[1].trim()
            // console.warn('modifiedPath', modifiedPath)
            // console.warn(localResList.includes(modifiedPath))
            if (localResList.includes(modifiedPath)) {

            }
            else {
              try {
                console.log('正在删除文件', currentFilePath)
                fs.unlinkSync(currentFilePath)
              }
              catch (err) {
                console.log(err)
              }
            }
          }
          else {
            this.checkFiles(currentFilePath)
          }
        }
      }
    }
    catch (error) {
      return console.log(error)
    }

  }

  //确保res目录存在
  ensureResPath() {
    try {
      fs.accessSync(this.resPath);
    }
    catch (err) {
      console.warn(err)
      return false
    }
  }

  writeFileSync(filePath, data, encoding) {
    fs.writeFileSync(filePath, data, encoding)
  }
}

export = new LocalResManager();