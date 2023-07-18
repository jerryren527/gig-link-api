const Proposal = require('../models/Proposal')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES, ROLES, JOB_STATUSES, PROPOSAL_STATUSES} = require('../config/constants')
const User = require('../models/User')
const Job = require('../models/Job')

// @desc Get all proposals
// @route GET /proposals
// @access Private
const getAllProposals = asyncHandler (async (req, res) => {
  const proposals = await Proposal.find().lean()

  if (!proposals?.length) {
    return res.status(400).json({ message: "No proposals found"})
  }

  res.json(proposals)
})


// @desc Create new proposal
// @route POST /proposals
// @access Private
const createNewProposal = asyncHandler(async (req, res) => {
  const {jobId, freelancerUsername} = req.body

  if (!jobId ||  !freelancerUsername  ) {
    return res.status(400).json({ message: "JobId, and freelancerUsername are required."})
  }

  const job = await Job.findById(jobId).lean().exec()
  if (job.status !== JOB_STATUSES.Pending) {
    return res.status(409).json({ message: `Cannot add a proposal to Job (ID ${job._id}) with status ${job.status}. A proposal can only be added to jobs with status Pending.`})
  }

  const duplicate = await Proposal.findOne({ freelancerUsername: freelancerUsername, jobId: jobId }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: `Duplicate proposal. Freelancer ${freelancerUsername} has already made a proposal to Job ${jobId}.`})
  }
  
  const proposal = await Proposal.create(req.body)
  console.log('proposal', proposal)

  if (proposal) {
    const freelancerObj = await User.findOne({username: freelancerUsername}).exec()
    if (freelancerObj.role !== ROLES.Freelancer) {
      return res.status(409).json({ message: "Proposal must be made by a user with status freelancer."})
    }
    freelancerObj.proposals = [...freelancerObj.proposals, proposal]
    const updatedFreelancerObj = await freelancerObj.save()
  
    const jobObj = await Job.findById(jobId).exec()
    jobObj.proposals = [...jobObj.proposals, freelancerUsername]
    const updatedJobObj = await jobObj.save()

    return res.status(201).json({ message: `New proposal (ID ${proposal._id}) for job ${jobObj._id} created.`})
  } else {
    return res.status(400).json({ message: 'Invalid proposal data received.'})
  }
})


// @desc Change proposal status
// @route PATCH /proposals/status
// @access Private
const changeProposalStatus = asyncHandler(async (req, res) => {
  const { proposalId, status } = req.body

  const proposal = await Proposal.findById(proposalId).exec()

  if (proposal.status === PROPOSAL_STATUSES.Accepted || proposal.status === PROPOSAL_STATUSES.Declined) {
    return res.status(409).json({ message: `Proposal ${proposalId} with status ${proposal.status} cannot be changed.`})
  }
  const prevStatus =  proposal.status
  proposal.status = status
  

  const message = []

  if (status === PROPOSAL_STATUSES.Accepted) {
    const job = await Job.findById(proposal.jobId).exec()
    job.status = JOB_STATUSES.Accepted
    job.freelancer = proposal.freelancer
    job.freelancerUsername = proposal.freelancerUsername
    
    const result = await User.updateOne({ _id: proposal.freelancer }, { $push: { activeJobs: job }})
    
    if (result.modifiedCount === 0) {
      return res.status(204)
    }

    message.push(`Changed Job ${job._id} status to ${job.status}. And added Job ${job._id} to freelancer ${proposal.freelancer} activeJobs.`)
    await job.save()
  }

  await proposal.save()

  message.push(`Changed Proposal (ID ${proposalId}) from status ${prevStatus} to ${status}.`)
  return res.status(200).json({ message: message.join(' ')})

})



// @desc Delete a proposal
// @route DELETE /proposals
// @access Private
const deleteProposal = asyncHandler(async (req, res) => {
  const { jobId, freelancerUsername } = req.body

  if (!jobId || !freelancerUsername)  {
    return res.status(400).json({ message: 'job ID and freelancerUsername required.'})
  }

  const proposal = await Proposal.findOne({ jobId: jobId, freelancerUsername: freelancerUsername}).lean().exec()

  if (proposal) {
    await User.updateMany(
      { username: freelancerUsername },
      { $pull: { proposals: proposal._id }}
    )

    await Job.updateMany(
      { _id: jobId },
      { $pull: { proposals: freelancerUsername }}
    )
    
    const result = await Proposal.deleteOne({ _id: proposal._id })
  
    return res.json({message: `Proposal ${proposal._id} deleted`})

  } else {
    return res.status(400).json({ message: 'Proposal not found.'})
  }

})


module.exports = {
  getAllProposals,
  createNewProposal,
  changeProposalStatus,
  deleteProposal
}
