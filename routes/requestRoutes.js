const express = require('express')
const router = express.Router()
const requestsController = require('../controllers/requestsController')

router.route('/')
  .get(requestsController.getAllRequests)
  .post(requestsController.createNewRequest)
  .patch(requestsController.updateRequest)
  .delete(requestsController.deleteRequest)

module.exports = router