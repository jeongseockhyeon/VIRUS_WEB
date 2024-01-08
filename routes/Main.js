const router = require('express').Router()
const path = require('path')

router.get('/', function (req, res) {
  const indexPath = path.join(__dirname, '../index.html')
  res.sendFile(indexPath)
})

module.exports = router