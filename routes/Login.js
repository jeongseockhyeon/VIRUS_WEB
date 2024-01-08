const passport = require('passport')
const bcrypt = require('bcryptjs')
const router = require('express').Router()
const MongoClient = require('mongodb').MongoClient
const LocalStrategy = require('passport-local').Strategy

let db

MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
  if (error) return console.log(error)
  db = client.db('virus_scan')
})

router.get('/', function (req, res) {
  res.render('login.ejs')
})


router.post(
  '/',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/mypage')
  }
)

passport.use(
  new LocalStrategy(
    {
      usernameField: 'inputEmail',
      passwordField: 'inputPassword',
      session: true,
      passReqToCallback: false,
    },
    function (inputEmail, inputPassword, done) {
      db.collection('users').findOne(
        { 이메일: inputEmail },
        function (err, result) {
          if (err) return done(err)
          if (!result)
            return done(null, false, { message: '가입되지 않은 이메일입니다.' })
          if (bcrypt.compareSync(inputPassword, result.비밀번호)) {
            return done(null, result)
          } else {
            return done(null, false, { message: '비밀번호가 틀렸습니다' })
          }
        }
      )
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user.이메일)
})
passport.deserializeUser(function (email, done) {
  db.collection('users').findOne({ 이메일: email }, function (err, result) {
    done(null, result)
  })
})

module.exports = router