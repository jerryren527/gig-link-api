const express = require('express')
const router = express.Router()
const jobsController = require('../controllers/jobsController')
const verifyJWT = require('../middlewares/verifyJWT')

router.use(verifyJWT)

router.route('/')
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJob)
  .put(jobsController.updateJob)
  .delete(jobsController.deleteJob)

router.route('/status')
  .patch(jobsController.updateJobStatus)

module.exports = router