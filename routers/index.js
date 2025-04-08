const express = require('express')
const router = express.Router()
const ControllUser = require('../controllers/controllUser')
const messageController = require('../controllers/messageController')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/register', ControllUser.register)
router.post('/login', ControllUser.login)
router.get('/group/:groupId', messageController.getMessage)
router.post('/group/:groupId', messageController.postMessage)

module.exports = router