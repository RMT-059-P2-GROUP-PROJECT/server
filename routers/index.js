require('dotenv').config()

const express = require('express')
const router = express.Router()
const ControllUser = require('../controllers/controllUser')
const AuthenticationMiddleware = require('../middleware/authentication')
const ControllGroup = require('../controllers/controllGroup')
const messageController = require('../controllers/messageController')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/register', ControllUser.register)
router.post('/login', ControllUser.login)
router.post('/google-login', ControllUser.googleLogin)

router.use(AuthenticationMiddleware)
router.get('/groups', ControllGroup.getGroup)
router.post('/groups', ControllGroup.createGroup)
router.get('/groups/join/:inviteCode', ControllGroup.shareGroup)
router.get('/groups/:groupId', messageController.getMessage)
router.post('/groups/:groupId', messageController.postMessage)
router.get('/summerize-AI/:groupId', messageController.summerizeAI)

router.post('/groups/link-generate/:groupId', ControllGroup.generateLink)

module.exports = router