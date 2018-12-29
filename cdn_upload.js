function computePackageSize(buildPath){
    const glob = require("glob");
    const fs = require('fs-extra');

    let sizeTotal = 0;

    glob(`${buildPath}/**/*.*`, {}, function (er, files) {
        files.forEach((file) => {
            sizeTotal += fs.statSync(file).size;
        });
        Editor.success(`[全部完成]初始包体共${files.length}个文件，总大小${(sizeTotal/1024).toFixed(0)}KB!`);
    })
}

function doRemoveFiles(buildPath, removePathList){
    const fs = require('fs-extra');
    const path = require('path');
    removePathList.forEach((removePath)=>{
        fs.removeSync( path.resolve(buildPath, removePath) );
    });
    // fs.removeSync(resPath);
    Editor.log('包体res目录清理成功!');
    
    computePackageSize(buildPath);
}

module.exports = function (buildPath, allDone) {
    
    const cwd = buildPath;
    const path = require('path');
    const fs = require('fs-extra');
    const glob = require("glob");
    //const request = require('request');
    const crypto = require('crypto');
    const async = require('async');
    var exec = require('child_process').exec;
    //const Curl = require('node-libcurl').Curl;
    
    const packagePath = path.resolve(Editor.projectInfo.path, `./package.json`);
    const packageJson = JSON.parse( fs.readFileSync(packagePath).toString() );

    let upLoadUrl = packageJson.cdnUploadAPI;
    let remotePath = packageJson.cdnPath;
    let full_upload = packageJson.full_upload;

    const removePathList = [
        './res/raw-assets/resources/dynamic',
        './res/raw-internal'
    ];
    [
        [`./res/import/**/*.json`, 20],
        [`./res/raw-assets/resources/persist/atlas/gueatCategory/*.png `, 0],
        [`./res/raw-assets/resources/persist/atlas/follow_official_account/*.png `, 0],
        [`./res/raw-assets/resources/persist/atlas/feedback/*.png `, 0],
        [`./res/raw-assets/resources/persist/atlas/anima/highlight.*.png `, 0],
        [`./res/raw-assets/resources/persist/atlas/anima/heartSplited.*.png `, 0],
        [`./res/raw-assets/resources/persist/atlas/anima/heartAlpha.*.png `, 0],
        [`./res/raw-assets/resources/persist/atlas/foodMenuScreen/*.png `, 0],
    ]
    .forEach((rpath)=>{
        const list = glob.sync(path.resolve(cwd, rpath[0]), {});
        list.forEach((file)=>{
            const size = (fs.statSync(file).size/1024).toFixed(0);
            if( size > rpath[1] ){
                // Editor.log(path.relative(cwd, file)+' = '+size+'kb');
                removePathList.push(path.relative(cwd, file));
            }
        });
    });

    let oldFiles = [];
    let newFiles = [];
    let totalFiles = [];
    let uploadFiles = [];
    const cdnUploadCacheFilePath = path.resolve(__dirname, './cdn_upload_cache/old_files_list.json');
    Editor.log(cdnUploadCacheFilePath);
    if(fs.existsSync(cdnUploadCacheFilePath)){
        Editor.log('cdn cache文件存在');
        oldFiles = JSON.parse(fs.readFileSync(cdnUploadCacheFilePath).toString());
    }else{
        Editor.log('cdn cache文件不存在');
    }

    

    // let fileLen = fs.statSync(filePath).size;
    let successCount = 0;
    let failedCount = 0;

    
    const resPath = path.resolve(buildPath, './res');
    glob(`${resPath}/**/*.*`, {}, function (er, files) {

        Editor.success('需要上传文件列表：');
        if(full_upload){
            uploadFiles = files;
            totalFiles = files.concat();
        }else{
            for(let i = 0; i < files.length; i++){
                let f_subPath = files[i].slice(buildPath.length+1);
                if(!oldFiles.includes(f_subPath)){
                    //新增文件
                    uploadFiles.push(files[i]);
                    newFiles.push(f_subPath);
                    Editor.success(f_subPath);
                }
            }
            totalFiles = oldFiles.concat(newFiles);
        }

        if(0 == uploadFiles.length){
            Editor.success('无');
            doRemoveFiles(buildPath, removePathList);
            allDone && allDone();
            return ;
        }
        Editor.success('[微信小游戏]开始上传资源文件到cdn');
        Editor.log(`远程目录：${remotePath}`);
        //逐个资源处理
        async.eachOfSeries(uploadFiles, (file, key, cb) => {
            let filePath = file;
            let subPath = filePath.slice(buildPath.length+1);
            Editor.log(`上传${subPath}`);
            let dateGMTstr = new Date().toGMTString();
            let fileData = fs.readFileSync(filePath);
            let sha1= crypto.createHash('sha1').update(fileData, 'utf8').digest('hex');
    
            const cmdStr = `curl -i -H "access-token: ${packageJson.access_token}" \
            -H "access-path: ${packageJson.access_path}" \
            -H "file-md5: ${sha1}" \
            -H "Content-Type: application/octet-stream" \
            -H "Last-Modifed: ${dateGMTstr}" \
            -X POST --upload-file "${filePath}" ${upLoadUrl}/${remotePath}/${subPath}`;
            //Editor.log(cmdStr);
            exec(cmdStr, function(err,stdout,stderr){
                if(err) {
                    Editor.log('uploadErr:'+stderr);
                } else {
                    // Editor.log('输出：');
                    // Editor.log(stdout);
                    if(stdout.search('200 OK') >= 0){
                        Editor.success('ok');
                        successCount ++;
                    }else{
                        Editor.error('failed');
                        failedCount ++;
                    }
                }
                cb();
            });
        }, ()=>{
            Editor.success(`执行上传文件总数：${uploadFiles.length}，成功上传数：${successCount}，失败上传数：${failedCount}`);

            Editor.success('[微信小游戏]资源处理到cdn完毕!');
            doRemoveFiles(buildPath, removePathList);

            // let fileListContent = '';


            // const initContent = JSON.stringify(totalFiles);
            fs.writeFileSync(cdnUploadCacheFilePath, JSON.stringify(totalFiles), 'utf8');
            allDone && allDone();
        });
    })


}