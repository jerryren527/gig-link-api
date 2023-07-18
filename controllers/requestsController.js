const Request = require('../models/Request')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES, ROLES, JOB_STATUSES} = require('../config/constants')
const User = require('../models/User')
const Job = require('../models/Job')


// @desc Get all requests
// @route GET /requests
// @access Private
const getAllRequests = asyncHandler (async (req, res) => {
  const requests = await Request.find().lean()

  if (!requests?.length) {
    return res.status(400).json({ message: "No requests found"})
  }

  res.json(requests)
})


// @desc Create new request
// @route POST /requests
// @access Private
const createNewRequest = asyncHandler(async (req, res) => {
  const {client, freelancer, title, description, price} = req.body

  if (!client ||  !freelancer ||  !title ||  !description || !price ) {
    return res.status(400).json({ message: "Client, Freelancer, Title, Description, and Price are required."})
  }

  // Only client's can create requests
  const clientObject = await User.findById(client).exec()
  if (clientObject.role !== ROLES.Client) {
    return res.status(409).json({ message: `User with ID ${client} has role ${clientObject.role}. Only clients can create requests.`})
  }

  const duplicate = await Request.findOne({ client: client, freelancer: freelancer, title: title, description: description, price: price }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate request."})
  }

  const request = await Request.create(req.body)

  if (request) {
    await User.updateOne({ _id: client}, { $push: { postedRequests: request }})
    
    await User.updateOne({ _id: freelancer}, { $push: { receivedRequests: request }})

    return res.status(201).json({ message: `New request \'${title}\' (ID: ${request._id}) created.`})
  } else {
    return res.status(400).json({ message: 'Invalid request data received.'})
  }
})

// @desc Update a request
// @route PUT /requests
// @access Private
const updateRequest = asyncHandler(async (req, res) => {
  const {client, freelancer, title, description, price} = req.body

  if (!req.body.requestId || !client ||  !freelancer ||  !title ||  !description || !price ) {
    return res.status(400).json({ message: "Client, Freelancer, Title, Description, and Price are required."})
  }

  const request = await Request.findById(req.body.requestId).exec()

  if (!request) {
    return res.status(400).json({ message: 'Request not found.'})
  }

  if (request.status === REQUEST_STATUSES.Accepted || request.status === REQUEST_STATUSES.Declined) {
    return res.status(409).json({ message: 'Request with status Completed or  Declined cannot be updated.'})
  } 
  
  const { requestId, ...otherProperties } = req.body

  const duplicate = await Request.findOne({ client: client, freelancer: freelancer, title: title, description: description, price: price})

  if (duplicate && duplicate._id.toString() !== requestId) {
    return res.status(409).json({ message: "Duplicate request. "})
  }  

  // Assign the updated job
  Object.assign(request, { ...request, ...otherProperties})
  const updatedRequest = await request.save()


  return res.json({ message: `Job, \'${updatedRequest.title}\', updated`})
})

// @desc Update a request
// @route PATCH /requests/status
// @access Private
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { requestId, status } = req.body

  // find request
  const request = await Request.findById(requestId).exec()

  if (!request) {
    return res.status(404).json({ message: `Request ${requestId} not found.`})
  }
  if (request.status === REQUEST_STATUSES.Accepted || request.status === REQUEST_STATUSES.Declined) {
    return res.status(409).json({ message: `Request with status ${request.status} cannot be changed.`})
  }
  
  const prevStatus = request.status
  request.status = status

  let message = ''
  const clientObj = await User.findById(request?.client)
  const freelancerObj = await User.findById(request?.freelancer)

  if (status === REQUEST_STATUSES.Accepted) {
    // when client changes request status from Pending to Accepted, create a Job and add to client’s User.openJobs, and add to freelancer’s User.activeJobs.
    const jobObj = {
      client: request.client,
      clientUsername: clientObj.username,
      freelancer: request.freelancer,
      freelancerUsername: freelancerObj.username,
      title: request.title,
      description: request.description,
      skills: request.skills,
      price: request.price,
      status: JOB_STATUSES.Accepted,
      startDate: request.startDate,
      dueDate: request.dueDate
    }
    const job = await Job.create(jobObj)
    job.freelancer = request.freelancer
    await job.save()
    
    await User.updateOne({ _id: request.client }, { $push: { openJobs: job }})
    await User.updateOne({ _id: request.freelancer }, { $push: { activeJobs: job }})

    message = `Job ${job._id} created, and updated client ${request.client} and freelancer ${request.freelancer}. `
  }
  
  
  await request.save()
  message += `Request ${requestId} status changed from ${prevStatus} to ${request.status}`
  
  return res.status(200).json({ message: message })
})



// @desc Delete a request
// @route DELETE /requests
// @access Private
const deleteRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body

  if (!requestId) {
    return req.status(400).json({ message: 'Request ID required.'})
  }

  const request = await Request.findById(requestId).exec()

  if (!request) {
    return res.status(400).json({ message: 'Request not found.'})
  }

  const result = await Request.deleteOne({ _id: requestId })

  return res.json({message: `Request \'${request.title}\' with ID ${request._id} deleted`})
})


module.exports = {
  getAllRequests,
  createNewRequest,
  updateRequest,
  updateRequestStatus,
  deleteRequest
}
