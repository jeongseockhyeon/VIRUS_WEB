const MongoClient = require('mongodb').MongoClient
const router = require('express').Router()

let db

MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
    if (error) return console.log(error)
    db = client.db('virus_scan')
})

function 로그인확인(요청, 응답, next) {
    if (요청.user) {
      next()
    } else {
      응답.send('로그인이 필요합니다.')
    }
}

router.get('/', 로그인확인, function (요청, 응답) {
    console.log(요청.user)
    db.collection('board.post')
        .find({ 작성자: 요청.user.아이디 })
        .toArray(function (에러, 결과) {
            응답.render('mypage.ejs', { user: 결과, 사용자: 요청.user })
        })
})

module.exports = router