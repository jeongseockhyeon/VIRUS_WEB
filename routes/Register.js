const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const MongoClient = require('mongodb').MongoClient

let db

MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
  if (error) return console.log(error)
  db = client.db('virus_scan')
})


router.get('/', function (req, res) {
  res.render('register.ejs')
})

router.post('/', async function (req, res) {
  const { 성, 이름, 아이디, 이메일, 비밀번호, 주소, 국가, 세부지역 } = req.body

  try {
    let user = await db.collection('users').findOne({ 이메일 })
    if (user) {
      return res
        .status(400)
        .json({ errors: [{ message: '이미 가입된 이메일입니다.' }] })
    }

    const hashedPassword = await bcrypt.hash(비밀번호, 10)
    user = new User({
      성,
      이름,
      아이디,
      이메일,
      비밀번호: hashedPassword,
      주소,
      국가,
      세부지역,
    })

    db.collection('users').insertOne(user)

    res.redirect('/login')
  } catch (error) {
    console.log(error)
    res.status(500).send('오류 발생')
  }
})

module.exports = router