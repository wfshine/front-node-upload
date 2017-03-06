/*
 * Author: shine
 * Date: 2016.10.21
 * Title: 图片上传、压缩、剪裁插件
 * */
var uploadImg = function (options) {
    /*
     * @count: 一次可上传的图片数量
     * @container:存放图片上传插件容器
     * @width:压缩图片宽度
     * @quality:压缩图片像素质量
     * @crop:true|false 是否开启剪裁图片功能
     * @uploadUrl 上传服务器的URL地址
     * */
    this.default = {
        container: 'upload-container',
        width: '400',
        quality: '1',
        crop: false,
        count: 10,
        uploadUrl: '',
        uploadDir: '',
        manageKey: '',
        compress: false
    };

    this.options = options || this.default;
    this.options.multiple = this.options.count > 1 ? "multiple" : "";
    this.options.containerCrop = this.options.container + '-crop-wrap';
    var that = this;
    console.log(that);
    var cropCss = that.options.crop ? "" : "crop-close";
    that.imgHtml = '<div class="file-input file-input-new ' + this.options.multiple + '">' +
        '<div class="file-preview">' +
        // '<div class="close fileinput-remove">×</div>' +
        '<div class="file-drop-disabled">' +
        '<div class="file-preview-thumbnails">' +
        '<div class="file-live-thumbs ' + cropCss + '"></div>' +
        '</div>' +
        '<div class="clearfix"></div>' +
        '<div class="file-preview-status text-center text-success"></div>' +
        '<div class="kv-fileinput-error file-error-message" style="display: none;"></div>' +
        '</div>' +
        '</div>' +
        '<div class="progress" style="display:none">' +
        '<div class="progress-bar progress-bar-success progress-bar-striped active"' +
        'role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"  style="width:0%;">' +
        '</div>' +
        '</div>' +
        '<div class="input-group file-caption-main">' +
        '<div class="input-group-btn">' +
        '<button class="btn btn-primary btn-file">' +
        '<i class="fa fa-folder-open"></i> 添加图片' +
        '<input id="' + that.options.container + '-file" class="file" type="file" accept="image/*" ' + that.options.multiple + '>' +
        '</div>' +
        '</div>' +
        '</div>';
    /*开启监听上传组件*/
    that.multipleUpload();
    /*控制是否开启图片剪裁功能*/
    if (that.options.crop) {
        // if (typeof $('#crop-image') == 'undefined' || $('#crop-image').length <= 0) {
        var cropHtml = '<div id="' + that.options.containerCrop + '" class="crop-image"><div class="crop-image-box"><div class="thumb-box"></div><div class="spinner" style="display: none"><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div></div></div><div class="crop-image-action"><div class="row"><div class="col-xs-12 col-sm-9 col-md-9 crop-inputs"><input type="text" class="crop-width" placeholder="宽"><span>px</span><input type="text" class="crop-height" placeholder="高"><span>px</span><button type="button" class="btn btn-info btn-set-size" title="设置裁剪尺寸"> 设置尺寸</button></div><div class="col-xs-12 col-sm-3 col-md-3 crop-buttons"><button type="button" class="btn btn-default btn-zoom-out" title="缩小"><i class="glyphicon glyphicon-resize-small"></i></button><button type="button" class="btn btn-default btn-zoom-in" title="放大"><i class="glyphicon glyphicon-resize-full"></i></button><button type="button" class="btn btn-default btn-crop" title="剪裁"><i class="glyphicon glyphicon-check"></i></button><button type="button" class="btn btn-default btn-cancel" title="取消"><i class="glyphicon glyphicon-remove"></i></button></div></div></div><div class="cropped"></div></div>';
        $('body').append(cropHtml);
        // }
        that.imageCrop();
    }
    $('#' + that.options.container).html(that.imgHtml);
    if (that.options.count === 1) {
        $('#' + that.options.container).find('.file-input').removeClass('file-input-new');
        that.renderHtml({'imgUrl': ''});
    }
};
uploadImg.prototype = {

    multipleUpload: function () {
        var that = this;
        /*监听选文件*/
        $(document).on('change', '#' + that.options.container + '-file', function () {
            var filesLength = this.files.length;
            var filesList = this.files;
            var currFilesCount = $('#' + that.options.container).find('.file-preview-frame').length;
            if (filesLength + currFilesCount > that.options.count && that.options.count !== 1) {
                that.tips("error", "您最多只能上传" + that.options.count + "张图片,请重试！");
                return false;
            }
            $('#' + that.options.container).find('.file-input').removeClass('file-input-new');
            var $progressBar = $('#' + that.options.container).find('.progress-bar');
            $progressBar.parent().show();
            for (var i = 0; i < filesLength; i++) {
                var fileInfo = {
                    name: filesList[i].name,
                    type: filesList[i].type
                };

                if (fileInfo.type.indexOf('image') < 0) {
                    // 不是图片
                    that.tips("error", "您选中的文件中包含非正确格式图片！");
                    $progressBar.css("width", "0%").parent().hide();
                    return false;
                }
                if (that.options.compress) {
                    lrz(filesList[i], {
                        width: that.options.width,
                        quality: that.options.quality
                    })
                        .then(function (rst) {
                            // 处理成功会执行
                            console.log(fileInfo);
                            // that.renderHtml(rst);
                            that.uploadByForm(rst.base64, fileInfo, function (file) {
                                console.log(file);
                                that.renderHtml(file);
                                $progressBar.css("width", (i + 1) * (100 / filesLength) + "%");
                            });
                        })
                        .catch(function (err) {
                            // 处理失败会执行
                            console.log("压缩失败");
                        })
                        .always(function () {
                            // 不管是成功失败，都会执行
                        });
                } else {
                    var reader = new FileReader();
                    reader.readAsDataURL(filesList[i]);
                    reader.onload = function (e) {
                        that.uploadByForm(e.target.result, fileInfo, function (file) {
                            console.log(file);
                            that.renderHtml(file);
                            $progressBar.css("width", (i + 1) * (100 / filesLength) + "%");
                        });
                    };
                }
            }
            window.setTimeout(function () {
                $progressBar.css("width", "0%").parent().hide();
            }, 1000);
        });
        // 移除所有已上传的图片dom
        $(document).on('click', '#' + that.options.container + ' .close,' + '#' + that.options.container + ' .fileinput-remove', function () {
            that.resetFileInput($('#' + that.options.container + '-file'));
            $('#' + that.options.container).find('.file-input').addClass('file-input-new');
            $('#' + that.options.container).find('.file-preview-frame').remove();
        });
        // 移除当前图片dom
        $(document).on('click', '#' + that.options.container + ' .single-remove', function () {
            that.resetFileInput($('#' + that.options.container + '-file'));
            $(this).parents('.file-preview-frame').remove();
            if (!$('#' + that.options.container).hasClass('file-preview-frame')) {
                $('#' + that.options.container).find('.file-input').removeClass('file-input-new');
            }
        });
        // 移除当前图片src
        $(document).on('click', '#' + that.options.container + ' .single-init', function () {
            $(this).parents('.file-preview-frame').find('.file-preview-image').attr('src', '');
        });
        // 裁剪当前图片
        $(document).on('click', '#' + that.options.container + ' .single-edit', function () {
            $(this).find('img').attr('id', that.options.container + '-curr-image');
        });
    },
    /* 根据接口传来的数据显示 */
    multipleShow: function (files) {
        var that = this;
        $('#' + that.options.container).find('.file-input').removeClass('file-input-new');
        if (files) {
            for (var i = 0; i < files.length; i++) {
                that.renderHtml(files[i]);
            }
        }
    },
    /* 渲染上传的每张图 */
    renderHtml: function (file) {
        var that = this;
        var previewHtml =
            '<div class="file-preview-frame">' +
            '<label class="kv-file-content single-edit" title="点击替换新图片" for="' + that.options.container + '-file">' +
            '<img src="' + file.imgUrl + '" class="kv-preview-data file-preview-image" alt="点击上传图片">' +
            '</label>' +
            '<div class="file-thumbnail-footer">' +
            // '<div class="file-footer-caption" title="'+files.origin.name+'">'+files.origin.name+' <br><samp>('+(files.fileLen/1024).toFixed(2)+' KB)</samp></div>'+
            '<div class="file-actions">' +
            '<div class="file-footer-buttons">' +
            '<div class="file-upload-indicator single-init" title="还原">' +
            '<i class="fa fa-trash-o"></i>' +
            '</div>' +
            '<div class="file-upload-indicator single-crop" title="编辑">' +
            '<i class="fa fa-edit"></i>' +
            '</div>' +
            '</div>' +
            '<div class="file-upload-indicator single-remove pull-left" title="删除">' +
            '<i class="fa fa-close"></i>' +
            '</div>' +
            '<div class="clearfix"></div>' +
            '</div>' +
            '</div>' +
            '</div>';
        var $currImage = $('#' + that.options.container + '-curr-image');
        if (that.options.count === 1) {
            $('#' + that.options.container).find('.file-live-thumbs').html(previewHtml);
        } else {
            if ($currImage.length === 1) {
                $currImage.attr('src', file.imgUrl);
                $currImage.removeAttr('id');
            } else {
                $('#' + that.options.container).find('.file-live-thumbs').append(previewHtml);
            }
        }
    },
    /* 重置file数据，防止删除某图片后不能再上传问题 */
    resetFileInput: function (file) {
        file.after(file.clone().val(""));
        file.remove();
    },
    /* 图片剪裁功能 */
    imageCrop: function () {
        var that = this;
        var cropOptions = {
                thumbBox: '.thumb-box',
                spinner: '.spinner',
                imgSrc: ''
            },
            cropper, $singleCrop;
        /* 监听并开启剪裁页面 */
        $(document).on('click', '#' + that.options.container + ' .single-crop', function () {
            $('#' + that.options.containerCrop).fadeIn();
            $singleCrop = $(this).parents('.file-preview-frame').find('img');
            cropOptions.imgSrc = $singleCrop.attr('src');
            cropper = $('#' + that.options.containerCrop + ' .crop-image-box').cropbox(cropOptions);
        });
        /* 确认剪裁 */
        $(document).on('click', '#' + that.options.containerCrop + ' .btn-crop', function () {
            var img = cropper.getDataURL();
            that.uploadByForm(img, '', function (file) {
                $('#' + that.options.containerCrop).fadeOut();
                $singleCrop.attr('src', file.imgUrl);
            });

        });
        /* 缩小原始图片 */
        $(document).on('click', '#' + that.options.containerCrop + ' .btn-zoom-in', function () {
            cropper.zoomIn();
        });
        /* 放大原始图片 */
        $(document).on('click', '#' + that.options.containerCrop + ' .btn-zoom-out', function () {
            cropper.zoomOut();
        });
        /* 取消剪裁 */
        $(document).on('click', '#' + that.options.containerCrop + ' .btn-cancel', function () {
            $('#' + that.options.containerCrop).fadeOut();
            $('#' + that.options.containerCrop + ' .crop-image-box').removeAttr('style');
        });
        /* 设置剪裁后的图片尺寸 */
        $(document).on('click', '#' + that.options.containerCrop + ' .btn-set-size', function () {
            var cropWidth = $('#' + that.options.containerCrop + ' .crop-width').val() + 'px';
            var cropHeight = $('#' + that.options.containerCrop + ' .crop-height').val() + 'px';
            $('#crop-image .thumb-box').css({
                "width": cropWidth,
                "height": cropHeight
            });
        });
    },
    /* 获取已上传的所有图片，以数据的形式返回 */
    getImagesList: function () {
        var that = this;
        var imagesList = $('#' + that.options.container).find('.file-preview-image').attr('src');
        return imagesList;
    },
    convertBase64UrlToBlob: function (urlData, filetype) {
        // 去掉url的头，并转换为byte
        var bytes = window.atob(urlData.split(',')[1]);

        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        var i;
        for (i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }

        return new Blob([ab], {
            type: filetype
        });
    },
    random: function () {
        return Math.random().toString().slice(2);
    },
    uploadByForm: function (base64, fileInfo, callback) {
        var fileType, fileName, fileExt;
        if (fileInfo !== '') {
            fileType = fileInfo.type;
            fileName = fileInfo.name;
            fileExt = fileName.substring(fileName.lastIndexOf('.'));
        } else {
            fileType = 'image/png';
            fileExt = '.png';
        }

        var that = this;
        var formData = new FormData();
        formData.append('uploadImage', that.convertBase64UrlToBlob(base64, fileType), that.random() + fileExt);
        formData.append('uploadDir', that.options.uploadDir);
        $.ajax({
            url: that.options.uploadUrl,
            type: 'POST',
            data: formData,
            /**
             * 必须false才会避开jQuery对 formdata 的默认处理
             * XMLHttpRequest会对 formdata 进行正确的处理
             */
            processData: false,

            /* 必须false才会自动加上正确的Content-Type */
            contentType: false,
            headers: {
                'managekey': that.options.manageKey
            },
            success: function (responseStr) {
                var file = {
                    imgUrl: responseStr
                };
                callback(file);
            },
            error: function (responseStr) {
                that.tips("error", "图片上传失败！");
            }
        });
    },
    tips: function (type, title) {
        var that = this;
        if (type === "error") {
            var $fileErrorMessage = $('#' + that.options.container).find('.file-error-message');
            $fileErrorMessage.show().html(title);
            window.setTimeout(function () {
                $fileErrorMessage.hide().html("");
            }, 5000);
        }

    }
};


/**
 * Shine 2016/1/13增加移动端拖动功能
 */

"use strict";
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    var cropbox = function (options, el) {
        var el = el || $(options.imageBox),
            obj =
            {
                state: {},
                ratio: 1,
                options: options,
                imageBox: el,
                thumbBox: el.find(options.thumbBox),
                spinner: el.find(options.spinner),
                image: new Image(),
                getDataURL: function () {
                    var width = this.thumbBox.width(),
                        height = this.thumbBox.height(),
                        canvas = document.createElement("canvas"),
                        dim = el.css('background-position').split(' '),
                        size = el.css('background-size').split(' '),
                        dx = parseInt(dim[0]) - el.width() / 2 + width / 2,
                        dy = parseInt(dim[1]) - el.height() / 2 + height / 2,
                        dw = parseInt(size[0]),
                        dh = parseInt(size[1]),
                        sh = parseInt(this.image.height),
                        sw = parseInt(this.image.width);

                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext("2d");
                    context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                    var imageData = canvas.toDataURL('image/png');
                    return imageData;
                },
                getBlob: function () {
                    var imageData = this.getDataURL();
                    var b64 = imageData.replace('data:image/png;base64,', '');
                    var binary = atob(b64);
                    var array = [];
                    for (var i = 0; i < binary.length; i++) {
                        array.push(binary.charCodeAt(i));
                    }
                    return new Blob([new Uint8Array(array)], {type: 'image/png'});
                },
                zoomIn: function () {
                    this.ratio *= 1.1;
                    setBackground();
                },
                zoomOut: function () {
                    this.ratio *= 0.9;
                    setBackground();
                }
            },
            setBackground = function () {
                var w = parseInt(obj.image.width) * obj.ratio;
                var h = parseInt(obj.image.height) * obj.ratio;

                var pw = (el.width() - w) / 2;
                var ph = (el.height() - h) / 2;

                el.css({
                    'background-image': 'url(' + obj.image.src + ')',
                    'background-size': w + 'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'
                });
            },
            imgMouseDown = function (e) {
                e.stopImmediatePropagation();

                obj.state.dragable = true;
                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            },
            imgMouseMove = function (e) {
                e.stopImmediatePropagation();

                if (obj.state.dragable) {
                    var x = e.clientX - obj.state.mouseX;
                    var y = e.clientY - obj.state.mouseY;

                    var bg = el.css('background-position').split(' ');

                    var bgX = x + parseInt(bg[0]);
                    var bgY = y + parseInt(bg[1]);

                    el.css('background-position', bgX + 'px ' + bgY + 'px');

                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                }
            },
            imgMouseUp = function (e) {
                e.stopImmediatePropagation();
                obj.state.dragable = false;
            },
            imgTouchStart = function (e) {
                e.preventDefault(); //阻止触摸事件的默认行为，即阻止滚屏
                var touch = e.targetTouches[0];
                // console.log('touch'+touch.pageX+':'+touch.pageY);
                e.stopImmediatePropagation();

                obj.state.dragable = true;
                obj.state.mouseX = touch.pageX;
                obj.state.mouseY = touch.pageY;
            },
            imgTouchMove = function (e) {
                e.preventDefault(); //阻止触摸事件的默认行为，即阻止滚屏
                var touch = e.targetTouches[0];
                // console.log(e);
                // console.log('touch'+touch.pageX+':'+touch.pageY);
                e.stopImmediatePropagation();

                if (obj.state.dragable) {
                    var x = touch.pageX - obj.state.mouseX;
                    var y = touch.pageY - obj.state.mouseY;

                    var bg = el.css('background-position').split(' ');

                    var bgX = x + parseInt(bg[0]);
                    var bgY = y + parseInt(bg[1]);

                    el.css('background-position', bgX + 'px ' + bgY + 'px');

                    obj.state.mouseX = touch.pageX;
                    obj.state.mouseY = touch.pageY;
                }
            },
            imgTouchEnd = function (e) {
                e.preventDefault(); //阻止触摸事件的默认行为，即阻止滚屏
                e.stopImmediatePropagation();
                obj.state.dragable = false;
            },
            zoomImage = function (e) {
                e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio *= 1.1 : obj.ratio *= 0.9;
                setBackground();
            }

        obj.spinner.show();
        obj.image.onload = function () {
            obj.spinner.hide();
            setBackground();

            el.bind('mousedown', imgMouseDown);
            el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
            el.bind('mousewheel DOMMouseScroll', zoomImage);
            // console.log(el.selector);
            var touchObj = document.querySelector(el.selector);
            touchObj.addEventListener("touchstart", imgTouchStart, false);
            touchObj.addEventListener("touchmove", imgTouchMove, false);
            touchObj.addEventListener("touchend", imgTouchEnd, false);
            // var hammertime = new Hammer(touchObj);
            // hammertime.get('pinch').set({enable: true});
            // hammertime.on('pinchin', function (e) {
            //     console.log(e);
            //     e.preventDefault();
            //     obj.zoomOut();
            // });
        };
        obj.image.src = options.imgSrc;
        el.on('remove', function () {
            $(window).unbind('mouseup', imgMouseUp)
        });
        return obj;
    };

    jQuery.fn.cropbox = function (options) {
        return new cropbox(options, this);
    };
}));


