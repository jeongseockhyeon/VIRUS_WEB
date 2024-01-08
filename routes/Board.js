const router = require('express').Router()
const MongoClient = require('mongodb').MongoClient

let db

function 로그인확인(요청, 응답, next) {
    if (요청.user) {
        next()
    } else {
        응답.send('로그인이 필요합니다.')
    }
}

MongoClient.connect(process.env.MONGODB_URL, function (error, client) {
    if (error) return console.log(error)
    db = client.db('virus_scan')
})

router.get('/', function (요청, 응답) {
    db.collection('board.post')
        .find()
        .toArray(function (에러, 결과) {
            console.log(결과)
            응답.render('board.ejs', { posts: 결과 })
        })
})

router.get('/write', 로그인확인, function (req, res) {
    res.render('write.ejs', { 사용자: req.user })
})

router.post('/add', function (요청, 응답) {
    console.log('제목: ' + 요청.body.title)
    console.log('내용: ' + 요청.body.content)
    console.log('날짜: ' + new Date())
    console.log('작성자: ' + 요청.body.아이디)

    db.collection('board.counter').findOne(
        { name: '게시물갯수' },
        function (에러, 결과) {
            var 총게시물갯수 = 결과.totalPost

            db.collection('board.post').insertOne(
                {
                    _id: 총게시물갯수 + 1,
                    제목: 요청.body.title,
                    내용: 요청.body.content,
                    날짜: new Date(),
                    작성자: 요청.body.아이디,
                },
                function (에러, 결과) {
                    db.collection('board.counter').updateOne(
                        { name: '게시물갯수' },
                        {
                            $inc: { totalPost: 1 },
                            function(에러, 결과) {
                                if (에러) {
                                    return console.log(에러)
                                }
                            },
                        }
                    )
                }
            )
        }
    )
    응답.redirect('/board')
})

router.get('/detail/:id', function (요청, 응답) {
    db.collection('board.post').findOne(
        { _id: parseInt(요청.params.id) },
        function (에러, 결과) {
            응답.render('detail.ejs', { data: 결과 })
        }
    )
})

router.get('/detail/:id/edit', function (요청, 응답) {
    db.collection('board.post').findOne(
        { _id: parseInt(요청.params.id) },
        function (에러, 결과) {
            응답.render('edit.ejs', { post: 결과 })
        }
    )
})

router.put('/edit', function (요청, 응답) {
    db.collection('board.post').updateOne(
        { _id: parseInt(요청.body.id) },
        {
            $set: {
                제목: 요청.body.title,
                내용: 요청.body.content,
                날짜: new Date(),
            },
        },
        function () {
            console.log('수정완료')
            응답.redirect('/board')
        }
    )
})

router.delete('/delete', function (요청, 응답) {
    요청.body._id = parseInt(요청.body._id)
    db.collection('board.post').deleteOne(
        { _id: 요청.body._id, 작성자: 요청.user.아이디 },
        function (에러, 결과) {
            console.log('삭제완료')
            console.log('에러', 에러)
            응답.status(200).send({ message: '성공했습니다' })
        }
    )
})

module.exports = router