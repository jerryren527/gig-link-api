const Request = require('../models/Request')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES} = require('../config/constants')


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

  // check for duplicate requests
  const duplicate = await Request.findOne({ client: client, freelancer: freelancer, title: title, description: description, price: price }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate request."})
  }

  const request = await Request.create(req.body)

  if (request) {
    return res.status(201).json({ message: `New request \'${title}\' created.`})
  } else {
    return res.status(400).json({ message: 'Invalid request data received.'})
  }
})

// @desc Update a request
// @route PATCH /requests
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
  deleteRequest
}
