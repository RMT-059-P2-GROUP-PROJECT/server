const express = require('express')
const router = express.Router()
const ControllUser = require('../controllers/controllUser')
const messageController = require('../controllers/messageController')

const AuthenticationMiddleware = require('../middleware/authentication')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/register', ControllUser.register)
router.post('/login', ControllUser.login)

router.use(AuthenticationMiddleware)
router.get('/group/:groupId', messageController.getMessage)
router.post('/group/:groupId', messageController.postMessage)

module.exports = router