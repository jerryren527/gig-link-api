const express = require('express')
const router = express.Router()
const proposalsController = require('../controllers/proposalsController')

router.route('/')
  // .get(proposalsController.getAllProposals)
  .post(proposalsController.createNewProposal)
  // .patch(proposalsController.updateProposal) // freelancer cannot edit a proposal
  .delete(proposalsController.deleteProposal)

module.exports = router