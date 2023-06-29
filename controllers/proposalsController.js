const Proposal = require('../models/Proposal')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES, ROLES} = require('../config/constants')
const User = require('../models/User')
const Job = require('../models/Job')

// @desc Get all proposals
// @route GET /proposals
// @access Private
// const getAllProposals = asyncHandler (async (req, res) => {
//   const proposals = await Proposal.find().lean()

//   if (!proposals?.length) {
//     return res.status(400).json({ message: "No proposals found"})
//   }

//   res.json(proposals)
// })


// @desc Create new proposal
// @route POST /proposals
// @access Private
const createNewProposal = asyncHandler(async (req, res) => {
  const {jobId, client, freelancer} = req.body

  if (!jobId || !client ||  !freelancer  ) {
    return res.status(400).json({ message: "JobId, Client, and Freelancer are required."})
  }

  // check for duplicate proposals
  const duplicate = await Proposal.findOne({ client: client, freelancer: freelancer, jobId: jobId }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate proposal."})
  }
  
  // create proposal
  const proposal = await Proposal.create(req.body)
  console.log('proposal', proposal)

  if (proposal) {
    // add proposal to User.proposals (as freelancer)
    const freelancerObj = await User.findById(freelancer).exec()
    if (freelancerObj.role !== ROLES.Freelancer) {
      return res.status(409).json({ message: "Proposal must be made by a user with status freelancer."})
    }
    freelancerObj.proposals = [...freelancerObj.proposals, proposal]
    const updatedFreelancerObj = await freelancerObj.save()
    console.log('updatedFreelancerObj', updatedFreelancerObj)
  
    // add proposals to Job.proposals
    const jobObj = await Job.findById(jobId).exec()
    jobObj.proposals = [...jobObj.proposals, proposal]
    const updatedJobObj = await jobObj.save()
    console.log('updatedJobObj', updatedJobObj)

    return res.status(201).json({ message: `New proposal for job ${jobObj._id} created.`})
  } else {
    return res.status(400).json({ message: 'Invalid proposal data received.'})
  }
})



// @desc Delete a proposal
// @route DELETE /proposals
// @access Private
const deleteProposal = asyncHandler(async (req, res) => {
  const { proposalId } = req.body

  if (!proposalId) {
    return req.status(400).json({ message: 'Proposal ID required.'})
  }

  const proposal = await Proposal.findById(proposalId).lean().exec()

  if (proposal) {
    // delete proposal ref in the User (freelancer)
    // updateMany() 1st arg is the filter condition. 2nd arg is the update object that defines the changes to be made.
    await User.updateMany(
      { proposals: proposalId },
      { $pull: { proposals: proposalId }}
    )
    
    // delete proposal ref in the Job
    await Job.updateMany(
      { proposals: proposalId },
      { $pull: { proposals: proposalId }}
    )
    
    const result = await Proposal.deleteOne({ _id: proposalId })
  
    return res.json({message: `Proposal ${proposal._id} deleted`})

  } else {
    return res.status(400).json({ message: 'Proposal not found.'})
  }

})


module.exports = {
  createNewProposal,
  deleteProposal
}
