const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyJWT = require('../middlewares/verifyJWT')

// router.use(verifyJWT)

router.route('/')
  .get(verifyJWT, usersController.getAllUsers)
  .post(usersController.createNewUser)
  .put(verifyJWT, usersController.updateUser)
  .delete(verifyJWT, usersController.deleteUser)
  
router.route('/inbox')
  .patch(verifyJWT, usersController.deleteMessage)

  
router.route('/:userId')
  .get(verifyJWT, usersController.getUser)

module.exports = router