var uploadFile = function (options) {
    this.default = {
        container: 'upload-wrap',
        uploadUrl: 'http://localhost:8012/upload',
        uploadDir: 'apk',
        manageKey: '',
        uploadButton: true,
        formName: 'upload_form',
        fileExt: 'apk',
        iMaxFilesize: 10104857600// 100MB
    };

    this.options = options || this.default;
    this.iBytesUploaded = 0;
    this.iBytesTotal = 0;
    this.iPreviousBytesLoaded = 0;
    this.oTimer = 0;
    this.sResultFileSize = '';
    var that = this;
    that.fileHtml = '<div class="file-input filetype"><div class="input-group file-caption-main"><div class="form-control file-caption"><input id="' + that.options.container + '-upload-response" class="file-caption-name" type="text" name="' + that.options.container + '-url" placeholder="请上传文件"></div><div class="input-group-btn"><div class="btn btn-default fileinput-upload fileinput-upload-button"><i class="glyphicon glyphicon-upload"></i>&nbsp;<span class="hidden-xs">上传文件</span></div><div class="btn btn-primary btn-file"><i class="fa fa-folder-open"></i>&nbsp;<span class="hidden-xs">选择文件</span><input id="' + that.options.container + '-file" type="file" name="' + that.options.container + '-file" class="file"></div></div></div><div id="' + that.options.container + '-progress" class="progress" ><div id="' + that.options.container + '-progress-bar" class="progress-bar progress-bar-success progress-bar-striped active" style="width:0%;"><span id="' + that.options.container + '-progress-percent">&nbsp;</span></div></div><div  id="' + that.options.container + '-file-info" class="file-info"><span id="' + that.options.container + '-filesize">&nbsp;</span><span id="speed">&nbsp;</span><span id="' + that.options.container + '-remaining">&nbsp;</span><span id="' + that.options.container + '-transfered" style="float:right">&nbsp;</span><span class="clear_both"></span></div><div id="' + that.options.container + '-error" class="file-error-message" ></div></div>';

    document.getElementById(that.options.container).innerHTML = that.fileHtml;
    that.fileSelected();

};
uploadFile.prototype = {

    fileSelected: function () {
        var that = this;
        document.getElementById(that.options.container + '-file').addEventListener("change", function () {
            var oFile = document.getElementById(that.options.container + '-file').files[0];
            var fileName = oFile.name;
            var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
            // 上传格式判断
            // var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
            if (!(fileExt === that.options.fileExt)) {
                that.tips('error', '上传类型不对!');
                return;
            }

            // 上传文件大小
            if (oFile.size > that.options.iMaxFilesize) {
                that.tips('error', '上传文件过大!');
                return;
            }
            that.startUploading();
        }, false);

    },

    startUploading: function () {
        var that = this;
        // cleanup all temp states
        that.iPreviousBytesLoaded = 0;
        document.getElementById(that.options.container + '-progress-percent').innerHTML = '0';
        var oProgress = document.getElementById(that.options.container + '-progress');
        var oProgressBar = document.getElementById(that.options.container + '-progress-bar');
        var fileinfo = document.getElementById(that.options.container + '-file-info');
        oProgress.style.display = 'block';
        oProgressBar.style.width = '0%';
        fileinfo.style.display = 'block';

        //var vFD = document.getElementById('upload_form').getFormData(); // for FF3
        var vFD = new FormData(document.getElementById(that.options.formName));
        vFD.append('uploadDir', that.options.uploadDir);
        var oXHR = new XMLHttpRequest();
        oXHR.upload.addEventListener('progress', function (e) {
            that.uploadProgress(e, that);
        }, false);
        oXHR.addEventListener('load', function (e) {
            that.uploadFinish(e, that);
        }, false);
        oXHR.addEventListener('error', function (e) {
            that.uploadError(e, that);
        }, false);
        oXHR.addEventListener('abort', function (e) {
            that.uploadAbort(e, that);
        }, false);
        oXHR.open('POST', that.options.uploadUrl);
        oXHR.setRequestHeader('managekey', that.options.manageKey);
        oXHR.send(vFD);

        // set inner timer
        that.oTimer = setInterval(that.doInnerUpdates(that), 300);
    },

    doInnerUpdates: function (that) {
        // 显示上传速度
        var iCB = that.iBytesUploaded;
        var iDiff = iCB - that.iPreviousBytesLoaded;

        // 没有加载退出
        if (iDiff == 0)
            return;

        that.iPreviousBytesLoaded = iCB;
        iDiff = iDiff * 2;
        var iBytesRem = that.iBytesTotal - that.iPreviousBytesLoaded;
        var secondsRemaining = iBytesRem / iDiff;

        // 更新上传速度
        var iSpeed = iDiff.toString() + 'B/s';
        if (iDiff > 1024 * 1024) {
            iSpeed = (Math.round(iDiff * 100 / (1024 * 1024)) / 100).toString() + 'MB/s';
        } else if (iDiff > 1024) {
            iSpeed = (Math.round(iDiff * 100 / 1024) / 100).toString() + 'KB/s';
        }

        document.getElementById(that.options.container + '-speed').innerHTML = iSpeed;
        document.getElementById(that.options.container + '-remaining').innerHTML = '| ' + that.secondsToTime(secondsRemaining);
    },

    uploadProgress: function (e, that) { // upload process in progress
        document.getElementById(that.options.container + '-progress').style.display = 'block';
        if (e.lengthComputable) {
            that.iBytesUploaded = e.loaded;
            that.iBytesTotal = e.total;
            var iPercentComplete = Math.round(e.loaded * 100 / e.total);
            var iBytesTransfered = that.bytesToSize(that.iBytesUploaded);

            document.getElementById(that.options.container + '-progress').style.display = 'block';
            document.getElementById(that.options.container + '-progress-percent').innerHTML = iPercentComplete.toString() + '%';
            document.getElementById(that.options.container + '-progress-bar').style.width = iPercentComplete.toString() + '%';
            document.getElementById(that.options.container + '-transfered').innerHTML = iBytesTransfered;
            if (iPercentComplete == 100) {
                var oUploadResponse = document.getElementById(that.options.container + '-upload-response');
            }
        } else {
            document.getElementById(that.options.container + '-progress').innerHTML = 'unable to compute';
        }
    },

    uploadFinish: function (e, that) { // upload successfully finished
        var oUploadResponse = document.getElementById(that.options.container + '-upload-response');
        var progressPercent = (that.options.container + '-progress-percent');
        var fileinfo = document.getElementById(that.options.container + '-file-info');
        var progress = document.getElementById(that.options.container + '-progress');
        var progressBar = document.getElementById(that.options.container + '-progress-bar');
        var filesize = document.getElementById(that.options.container + '-filesize');
        var remaining = document.getElementById(that.options.container + '-remaining');
        oUploadResponse.value = e.target.responseText;
        oUploadResponse.style.display = 'block';
        progressPercent.innerHTML = '100%';
        progressBar.style.width = '100%';
        filesize.innerHTML = that.sResultFileSize;
        remaining.innerHTML = '| 00:00:00';
        setTimeout(function () {
            fileinfo.style.display = 'none';
            progress.style.display = 'none';

        }, 3000);
        clearInterval(that.oTimer);
    },

    uploadError: function (e, that) { // upload error
        that.tips('error', 'uploadError');
    },

    uploadAbort: function (e, that) { // upload abort
        that.tips('error', 'uploadAbort');
        clearInterval(that.oTimer);
    },
    secondsToTime: function (secs) { // we will use this function to convert seconds in normal time format
        var hr = Math.floor(secs / 3600);
        var min = Math.floor((secs - (hr * 3600)) / 60);
        var sec = Math.floor(secs - (hr * 3600) - (min * 60));

        if (hr < 10) {
            hr = "0" + hr;
        }
        if (min < 10) {
            min = "0" + min;
        }
        if (sec < 10) {
            sec = "0" + sec;
        }
        if (hr) {
            hr = "00";
        }
        return hr + ':' + min + ':' + sec;
    },

    bytesToSize: function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    },
    tips: function (type, title) {
        var that = this;
        if (type === "error") {
            var $fileErrorMessage = document.getElementById(that.options.container + '-error');
            $fileErrorMessage.style.display = 'block';
            $fileErrorMessage.innerHTML = title;
            window.setTimeout(function () {
                $fileErrorMessage.style.display = 'none';
                $fileErrorMessage.innerHTML = '';
            }, 5000);
        }
        clearInterval(that.oTimer);
    }
};