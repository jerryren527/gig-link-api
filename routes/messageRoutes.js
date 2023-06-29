const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messagesController')

// router.route('/sent')
//   .get(messagesController.getSentMessages)

// router.route('/received')
//   .get(messagesController.getReceivedMessages)

router.route('/')
  .post(messagesController.createNewMessage)

module.exports = router