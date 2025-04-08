const express = require('express')
const router = express.Router()
const ControllUser = require('../controllers/controllUser')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/register', ControllUser.register)
router.post('/login', ControllUser.login)

module.exports = router