    前端插件说明：
    基于bootstrap3与jquery2，实现的HTML5多图上传、压缩、剪裁
    （1）上传图片用法：
        1、css：
        <link rel="stylesheet" href="css/fileinput.css">
        2、js:
        <script src="js/lrz/dist/lrz.bundle.js"></script>
        <script src="js/my-upload.js"></script>
        3、图片上传初始化
        /*
        * @count: 一次可上传的图片数量
        * @container:存放图片上传插件容器
        * @width:压缩图片宽度
        * @quality:压缩图片像素质量
        * @crop:true|false 是否开启剪裁图片功能
        * @uploadDir 上传图片的二级目录
        * @compress:  控制是否开启压缩
        * */
        var myUpload=new myUpload({
        container:'upload-container',
        width:'800',
        quality:'1',
        crop:true,
        count:20,
        uploadDir:'uploadDir2',
        compress:true
        });
        4、读取已存在图片列表方法：
        /*
        *@imgUrl 图片src
        **/
        myUpload.multipleShow([{ "imgUrl": "img/Koala.jpg" },{ "imgUrl": "img/Penguins.jpg" }])
        5、获取当前已上传图片地址：
        myUpload.getImagesList();
        结果为：["图片url1","图片url2"]
    （2）文件上传
        1、css：
        <link rel="stylesheet" href="css/fileinput.css">
        2、js:
        <script src="js/my-uploadfile.js"></script>
        3、文件上传初始化
        /*
        * @container:存放图片上传插件容器
        * @uploadDir 上传图片的二级目录
        * @compress:  控制是否开启压缩
        * @formName： form表单ID名
        * @fileExt： 校验文件扩展名
        * @iMaxFilesize：最大可上传的文件大小限制
        * */
        var myUpload=new uploadFile({
            container: 'upload-wrap',
            uploadUrl: 'http://localhost:3001/upload',
            uploadDir: 'apk',
            formName:'upload_form',
            fileExt:'wmv',
            iMaxFilesize:101048576// 1MB
        });