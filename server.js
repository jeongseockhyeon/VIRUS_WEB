const express = require('express');
const multer = require('multer');
const app = express();

app.listen(8000, function () {
  console.log('listening on 8000');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

app.get('/login2', function (req, res) {
  res.sendFile(__dirname + '/login2.html');
});
app.use('/public', express.static('public'));

app.use(express.static('public'));
// 파일 저장 디렉토리 설정
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'upload/');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

// 파일 업로드 미들웨어 생성
const upload = multer({ storage: storage });

// 파일 업로드 처리 라우터
app.post('/upload', upload.single('file'), (req, res) => {
  // single 메서드를 이용하여 하나의 파일만 업로드하도록 설정
  // 'file'은 프론트엔드에서 업로드할 때 사용한 name 속성 값입니다.

  if (!req.file) {
    res.status(400).send('파일이 업로드되지 않았습니다.');
  } else {
    res.send('파일이 업로드되었습니다.');
  }
});
//라라라
