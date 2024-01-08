const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const MongoClient = require('mongodb').MongoClient
const app = express()

const { ObjectId } = require('mongodb')

const passport = require('passport')
const session = require('express-session')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: true }))

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use('/public', express.static('public'))
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs')

require('dotenv').config()

let uploadFilePath = ''
let db

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

MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
  if (error) return console.log(error)
  db = client.db('virus_scan')
  app.listen(8000, function () {
    console.log('listening on 8000')
  })
})

const Main = require('./routes/Main')
app.use('/',Main)

const Login = require('./routes/Login')
app.use('/login',Login)

const Register = require('./routes/Register')
app.use('/register',Register)


// 마이페이지
const MyPage = require('./routes/MyPage')
app.use('/mypage',MyPage)


// 로그아웃 기능
const Logout = require('./routes/Logout')
app.use('/logout',Logout)

// 게시판 기능
const Board = require('./routes/Board')
app.use('/board',Board)

//바이러스토탈 검사
const VirusScan = require('./routes/VirusScan')
app.use('/virusscan',VirusScan)

// 매크로 검색
const MacroScan = require('./routes/MacroScan')
app.use('/macroscan',MacroScan)

