const express = require('express')
const router = express.Router()
const ControllUser = require('../controllers/controllUser')
const AuthenticationMiddleware = require('../middleware/authentication')
const ControllGroup = require('../controllers/controllGroup')

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.post('/register', ControllUser.register)
router.post('/login', ControllUser.login)

router.use(AuthenticationMiddleware)
router.post('/groups', ControllGroup.createGroup)

module.exports = router