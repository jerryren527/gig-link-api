const express = require('express')
const router = express.Router()
const requestsController = require('../controllers/requestsController')
const verifyJWT = require('../middlewares/verifyJWT')

router.use(verifyJWT)

router.route('/')
  .get(requestsController.getAllRequests)
  .post(requestsController.createNewRequest)
  .put(requestsController.updateRequest)
  .delete(requestsController.deleteRequest)

router.route('/status')
  .patch(requestsController.updateRequestStatus)

module.exports = router