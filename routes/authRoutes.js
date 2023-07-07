const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.route('/logIn')
  .post(authController.logIn)

router.route('/signUp')
  .post(authController.signUp)

router.route('/refresh')
  .get(authController.refresh)

router.route('/logout')
  .post(authController.logout)

module.exports = router