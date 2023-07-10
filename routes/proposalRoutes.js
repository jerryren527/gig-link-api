const express = require('express')
const router = express.Router()
const proposalsController = require('../controllers/proposalsController')
const verifyJWT = require('../middlewares/verifyJWT')

router.use(verifyJWT)

router.route('/')
  .get(proposalsController.getAllProposals)
  .post(proposalsController.createNewProposal)
  .delete(proposalsController.deleteProposal)


router.route('/status')
  .patch(proposalsController.changeProposalStatus)
module.exports = router