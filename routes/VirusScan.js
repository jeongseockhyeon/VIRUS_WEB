const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { ObjectId } = require('mongodb')


const router = require('express').Router()
const MongoClient = require('mongodb').MongoClient

const allowedExtensions = [
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
    '.xls',
    '.xlsx',
    '.xlsm',
    '.pdf',
]

const scanEngine = [
    'Bkav',
    'Lionic',
    'tehtris',
    'DrWeb',
    'ClamAV',
    'CMC',
    'CAT-QuickHeal',
    'ALYac',
    'Malwarebytes',
    'Zillya',
    'Paloalto',
    'Sangfor',
    'K7AntiVirus',
    'Alibaba',
    'K7GW',
    'CrowdStrike',
    'BitDefenderTheta',
    'VirIT',
    'Cyren',
    'SymantecMobileInsight',
    'Symantec',
    'Elastic',
    'ESET-NOD32',
    'APEX',
    'TrendMicro-HouseCall',
    'Avast',
    'Cynet',
    'Kaspersky',
    'BitDefender',
    'NANO-Antivirus',
    'SUPERAntiSpyware',
    'MicroWorld-eScan',
    'Tencent',
    'Trustlook',
    'TACHYON',
    'Sophos',
    'F-Secure',
    'Baidu',
    'TrendMicro',
    'McAfee-GW-Edition',
    'Trapmine',
    'FireEye',
    'Emsisoft',
    'SentinelOne',
    'GData',
    'Jiangmin',
    'Webroot',
    'Avira',
    'Antiy-AVL',
    'Gridinsoft',
    'Xcitium',
    'Arcabit',
    'ViRobot',
    'ZoneAlarm',
    'Avast-Mobile',
    'Microsoft',
    'Google',
    'BitDefenderFalx',
    'AhnLab-V3',
    'Acronis',
    'McAfee',
    'MAX',
    'VBA32',
    'Cylance',
    'Zoner',
    'Rising',
    'Yandex',
    'Ikarus',
    'MaxSecure',
    'Fortinet',
    'AVG',
    'Panda',
]

let db

MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
  if (error) return console.log(error)
  db = client.db('virus_scan')
})


// 파일 저장 디렉토리 설정
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'upload/')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    },
})
let uploadFilePath = ''
// 파일 업로드 미들웨어 생성
const upload = multer({ storage: storage })

// 파일 삭제 처리 함수
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('파일 삭제 오류', err)
        } else {
            console.log('파일 삭제 완료')
        }
    })
}

// 파일 업로드 처리 라우터
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.status(400).send('파일이 업로드되지 않았습니다.')
        return
    }
    const filePath = path.resolve(req.file.path)
    uploadFilePath = filePath
    const fileExtension = path.extname(req.file.originalname).toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
        deleteFile(filePath)
        res.status(400).send('허용되지 않는 파일입니다.')
        return
    }

    console.log('파일 유형:', fileExtension)
    console.log('업로드 완료!')
    res.redirect('/virusscan/scan')
})

//파이썬 프로그램 호출 및 파일 경로 전송
router.get('/scan', (req, res) => {
    const filePath = uploadFilePath
    const absFilePath = path
        .resolve(filePath)
        .replace(new RegExp(`\\${path.sep}`, 'g'), `\\\\`)
    const pyPath = path.join(__dirname, '../pyutile', 'scanfile.py')
    console.log(`스캔 요청 - 파일 경로: ${absFilePath}`)
    const { spawn } = require('child_process')

    const command = 'python'
    //const pyPath = path.join(__dirname, '../pyutile', 'scanfile.py')
    const args = [pyPath, absFilePath]
    const options = {
        cwd: __dirname, // scanfile.py 파일이 있는 디렉토리로 설정
    }

    const pythonProcess = spawn(command, args, options)

    let pythonResult = ''

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
        pythonResult += data
    })

    pythonProcess.stdout.on('end', () => {
        console.log('Python process ended')
        deleteFile(uploadFilePath)
        // DB에서 이미 저장된 결과값인지 검색
        db.collection('scanresult').findOne({ result: pythonResult }, (error, existingResult) => {
            if (error) {
                console.error('MongoDB 조회 오류', error);
                res.status(500).send('Internal Server Error');
                return;
            }

            console.log('DB 확인');
            if (!existingResult) {
                // pythonResult가 이미 저장되지 않은 경우
                console.log('DB에 저장되어 있지 않은 악성 문서입니다.')
                db.collection('scanresult').insertOne({ result: pythonResult }, (error, result) => {
                    if (error) {
                        console.error('MongoDB 저장 오류', error);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    const savedId = result.insertedId;  // 삽입된 문서의 _id 값
                    console.log(savedId);
                    console.log('결과 저장 완료');
                    res.redirect(`/virusscan/result/${savedId}`);
                });
            } else {
                // pythonResult가 이미 저장된 경우
                console.log('DB에 저장되어 있는 악성 문서입니다.')
                const findId = existingResult._id;  // 이미 저장된 문서의 _id 값
                console.log(findId);
                res.redirect(`/virusscan/result/${findId}`);
            }
        });
    })

    pythonProcess.stderr.on('data', (data) => {
        if (data.includes('에러')) {
            console.error(`stderr: ${data}`)
            res.status(500).send('Internal Server Error')
        }
    })

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`)
    })
})

router.get('/result/:id', function (req, res) {
    const id = req.params.id
    const objectId = new ObjectId(id)
    console.log(objectId)
    db.collection('scanresult').findOne(
        { _id: objectId },
        function (err, result) {
            if (err) {
                console.error('데이터베이스 조회 오류', err)
                res.status(500).send('Internal Server Error')
                return
            }

            if (!result) {
                console.error('결과를 찾을 수 없습니다')
                res.status(404).send('Not Found')
                return
            }

            try {
                jsonResult = JSON.parse(result.result)
                console.log(jsonResult)
                res.render('result.ejs', { scanResult: jsonResult, scanEngine })
            } catch (error) {
                console.error('JSON 파싱 오류', error)
                res.status(500).send('Internal Server Error')
            }
        }
    )
})

module.exports = router