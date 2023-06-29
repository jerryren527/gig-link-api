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
// @route PATCH /jobs
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
  deleteJob
}
