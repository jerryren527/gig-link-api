const express = require('express')
const router = express.Router()
const jobsController = require('../controllers/jobsController')

router.route('/')
  .get(jobsController.getAllJobs)
  .post(jobsController.createNewJob)
  .put(jobsController.updateJob)
  .delete(jobsController.deleteJob)

router.route('/status')
  .patch(jobsController.updateJobStatus)

// router.route('/proposals')
//   .patch(jobsController.addJobProposal)

module.exports = router