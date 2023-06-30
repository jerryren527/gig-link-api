const Job = require('../models/Job')
const asyncHandler = require('express-async-handler')   // prevents us from using so many try-catch blocks when using asyn methods
const bcrypt = require('bcrypt')
const {JOB_STATUSES} = require('../config/constants')
const User = require('../models/User')


// @desc Get all jobs
// @route GET /jobs
// @access Private
const getAllJobs = asyncHandler (async (req, res) => {
  const jobs = await Job.find().lean()

  if (!jobs?.length) {
    return res.status(400).json({ message: "No jobs found"})
  }

  res.json(jobs)
})

// @desc Create new job
// @route POST /jobs
// @access Private
const createNewJob = asyncHandler(async (req, res) => {
  const {title, description, client, skills, price, startDate, dueDate } = req.body

  if (!title || !description || !client || !price) {
    res.status(400).json({ message: "Title, Description, Client, and Price are required."})
  }

  // check for duplicate requests
  const duplicate = await Job.findOne({ title: title, description: description, client: client, price: price }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate job."})
  }
  
  const jobObject = {
    title,
    description,
    client,
    skills,
    price,
    startDate,
    dueDate
  }

  const job = await Job.create(jobObject)

  if (job) {
    // add job to client's User.openJobs
    await User.updateOne({ _id: client }, { $push: { openJobs: job }})

    res.status(201).json({ message: `New job \'${title}\' created.`})
  } else {
    res.status(400).json({ message: 'Invalid job data received.'})
  }
})

// @desc Update a job
// @route PUT /jobs
// @access Private
const updateJob = asyncHandler(async (req, res) => {
  const {jobId, title, description, skills, price, startDate, dueDate, status, newProposal } = req.body
  // console.log( {jobId, title, description, skills, price, startDate, dueDate, status, newProposal })

  if (!jobId || !title || !description || !price) {
    res.status(400).json({ message: "JobId, Title, Description, and Price are required."})
  }

  // no .lean() here because we want access to .save() method.
  const job = await Job.findById(jobId).exec()

  if (!job) {
    res.status(400).json({ message: 'Job not found.'})
  }

  if (job.status === JOB_STATUSES.Completed || job.status === JOB_STATUSES.Cancelled) {
    return res.status(409).json({ message: 'Job with status Completed or  Cancelled cannot be updated.'})
  } 
  if (job.status === JOB_STATUSES.Pending) {
    if (status && status !== JOB_STATUSES.Accepted) {
      return res.status(409).json({ message: `Job with status Pending cannot be updated to ${status}. Its status can only be updated to Accepted.`})
    }
  } 
  if (job.status === JOB_STATUSES.Accepted) {
    if (status && status === JOB_STATUSES.Pending) {
      return res.status(409).json({ message: `Job with status Accepted cannot be updated to ${status}. Its status can only be updated to Completed or Cancelled.`})
    }
  }

  let proposals = []
  if (newProposal) {
    proposals = [...job.proposals, newProposal]
  }

  const jobObject = {
    title, description, skills, price, startDate, dueDate, status, proposals
  }


  const duplicate = await Job.findOne({ title: title, description: description, price: price })

  if (duplicate && duplicate._id.toString() !== jobId) {
    return res.status(409).json({ message: "Duplicate job. "})
  }  

  // Assign the updated job
  Object.assign(job, { ...job, ...jobObject})
  const updatedJob = await job.save()


  return res.json({ message: `Job, \'${updatedJob.title}\', updated`})
})

// @desc Update a job status
// @route PATCH /jobs/status
// @access Private
const updateJobStatus = asyncHandler( async (req, res) => {
  // const jobId = req.params.jobId
  const { jobId, status } = req.body
  const job = await Job.findById(jobId).exec()

  if (!job) {
    return res.status(404).json({ messsage: `Job Id ${jobId} is not found.`})
  }

  // Removed because a job's status will only change from Pending to Accepted through interaction with Proposals or Requests
  // pending -> accepted only. 
  // if (job.status === JOB_STATUSES.Pending) {
  //   if (status !== JOB_STATUSES.Accepted || status !== JOB_STATUSES.Cancelled) {
  //     return res.status(409).json({ message: `Job status Pending can only be changed to Accepted or Cancelled.`})
  //   }
  // }

  // accepted -> completed or cancelled only 
  // cannot change to pending
  if (job.status === JOB_STATUSES.Accepted) {
    if (status === JOB_STATUSES.Pending) {
      return res.status(409).json({ message: `Job status Accepted cannot be changed to Pending.`})
    }
    // Guard for requests to explicitly check if Job.freelancer is defined. Should always be defined through interaction with Proposals or Requests.
    if (!job.freelancer) {
      return res.status(409).json({ message: `Job ${jobId}'s status cannot be updated because Job.freelancer is not defined.`})
    }
  }
  if (job.status === JOB_STATUSES.Completed || job.status === JOB_STATUSES.Cancelled) {
    return res.status(409).json({ message: `Job status ${job.status} cannot be changed.`})
  }

  const prevStatus = job.status
  job.status = status
  await job.save()

  return res.status(200).json({ message: `Job Id ${jobId} found and updated from ${prevStatus} to ${status}`})
})

// // @desc Add proposal to job
// // @route PATCH /jobs/proposal
// // @access Private
// const addJobProposal = asyncHandler( async (req, res) => {
//   const { jobId, proposalId } = req.body

//   const result = await Job.updateOne({ _id: jobId }, { $push: { proposals: proposalId }})

//   if (result.modifiedCount === 0) {
//     return res.status(204)
//   } 

//   return res.status(200).json({ message: `Proposal ${proposalId} was added to Job ${jobId}'s`})
// })

// @desc Delete a job
// @route DELETE /jobs
// @access Private
const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body

  if (!jobId) {
    req.status(400).json({ message: 'Job ID required.'})
  }

  const job = await Job.findById(jobId).exec()

  if (!job) {
    return res.status(400).json({ message: 'Job not found.'})
  }

  const result = await Job.deleteOne()

  return res.json({message: `Job \'${job.title}\' with ID ${job._id} deleted`})
})


module.exports = {
  getAllJobs,
  createNewJob,
  updateJob,
  updateJobStatus,
  // addJobProposal,
  deleteJob
}
