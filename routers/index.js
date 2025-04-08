const express = require('express')
const router = express.Router()
const ControllUser = require('../controllers/controllUser')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/register', ControllUser.register)

module.exports = router