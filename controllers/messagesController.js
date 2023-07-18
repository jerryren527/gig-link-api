const Message = require('../models/Message')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES, ROLES} = require('../config/constants')
const User = require('../models/User')

// @desc Get all messages
// @route GET /messages
// @access Private
const getAllMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().lean()

  if (!messages?.length) {
    return res.status(400).json({ message: "No messages found"})
  }

  res.json(messages)
})

// @desc Create new message
// @route POST /messages
// @access Private
const createNewMessage = asyncHandler(async (req, res) => {
  const {title, body, sender, senderUsername, recipient, recipientUsername, date} = req.body

  if (!title || !body || !senderUsername || !recipientUsername ) {
    return res.status(400).json({ message: "Title, Body, Sender, Recipient are required."})    
  }

  if (senderUsername === recipientUsername) {
    return res.status(409).json({ message: "Sender and recipient must not be the same user."})
  }

  const createdMessage = await Message.create(req.body)

  if (createdMessage) {
    await User.updateOne({ username: senderUsername}, { $push: { sentMessages: createdMessage}})
    await User.updateOne({ username: recipientUsername}, { $push: { receivedMessages: createdMessage}})
    

    return res.status(201).json({ message: `New message (${createdMessage._id}) for \'${recipient}\' created.`})
  } else {
    return res.status(400).json({ message: 'Invalid message data received.'})
  }
})


module.exports = {
  getAllMessages,
  createNewMessage,
}
