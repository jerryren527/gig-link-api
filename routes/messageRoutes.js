const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')
const verifyJWT = require('../middlewares/verifyJWT')

router.use(verifyJWT)

router.route('/')
  .get(messagesController.getAllMessages)
  .post(messagesController.createNewMessage)

module.exports = router