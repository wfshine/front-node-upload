var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var uploadfoldername = 'uploadfiles';


function uploadMulter(dir) {

  var uploadImagePath = './public/' + uploadfoldername + '/' + dir;
  if (fs.existsSync(uploadImagePath)) {
    console.log('已经创建过此更新目录了');
  } else {
    fs.mkdirSync(uploadImagePath);
    console.log('更新目录已创建成功\n');
  }
  console.log('dir:' + dir);
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadImagePath)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  var upload = multer({storage: storage});
  return upload;
}
/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', {title: 'Express'});
  res.redirect('/myUpload/demo.html');
});
router.post('/upload', uploadMulter('ad').any(), function (req, res, next) {
  // 设置允许跨域的域名称
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

  var imgUrl = path.join('/', uploadfoldername,'ad', req.files[0].filename);
  console.log(req.files);
  console.log(imgUrl);
  res.send(imgUrl);
});

module.exports = router;
