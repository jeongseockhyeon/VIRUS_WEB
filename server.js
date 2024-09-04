const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const MongoClient = require('mongodb').MongoClient
const app = express()



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

let db


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

