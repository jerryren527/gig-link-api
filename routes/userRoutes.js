const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')

router.route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createNewUser)
  .put(usersController.updateUser)
  .delete(usersController.deleteUser)
  
router.route('/inbox')
  .patch(usersController.deleteMessage)

  
router.route('/:userId')
  .get(usersController.getUser)

module.exports = router