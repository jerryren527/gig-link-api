const Message = require('../models/Message')
const asyncHandler = require('express-async-handler')
const {REQUEST_STATUSES, ROLES} = require('../config/constants')
const User = require('../models/User')

// The logic for getting User sent messages or received messages should belong in usersController, not here.


// @desc Get all messages
// @route GET /messages/sent
// @access Private
// const getSentMessages = asyncHandler (async (req, res) => {

//   const {userId} = req.body

//   const messages = await Message.find({ sender: userId }).lean().exec()

//   if (!messages?.length) {
//     return res.status(400).json({ message: `No Sent messages found for user, ${userId}`})
//   }

//   res.json(messages)
// })

// @desc Get all messages
// @route GET /messages/received
// @access Private
// const getReceivedMessages = asyncHandler (async (req, res) => {

//   const {userId} = req.body

//   const messages = await Message.find({ recipient: userId }).lean().exec()

//   if (!messages?.length) {
//     return res.status(400).json({ message: `No Received messages found for user, ${userId}`})
//   }

//   res.json(messages)
// })

// @desc Create new message
// @route POST /messages
// @access Private
const createNewMessage = asyncHandler(async (req, res) => {
  const {title, body, sender, recipient, date} = req.body

  if (!title || !body || !sender || !recipient || !date) {
    return res.status(400).json({ message: "Title, Body, Sender, Recipient, Date are required."})    
  }

  // Make sure that sender and recipient are not the same User
  if (sender.toString() === recipient.toString()) {
    return res.status(409).json({ message: "Sender and recipient must not be the same user."})
  }

  // duplicate messages are allowed.
  const createdMessage = await Message.create(req.body)

  if (createdMessage) {
    // add message to sender's sentMessages
    // const senderObject = await User.findById(sender).exec()
    // senderObject.sentMessages = [...senderObject.sentMessages, createdMessage]
    // await senderObject.save()
    await User.updateOne({ _id: sender}, { $push: { sentMessages: createdMessage}})

    
    // add message to recipient's receivedMessages
    // const recipientObject = await User.findById(recipient).exec()
    // recipientObject.receivedMessages = [...recipientObject.receivedMessages, createdMessage]
    // await recipientObject.save()
    await User.updateOne({ _id: recipient}, { $push: { receivedMessages: createdMessage}})
    

    return res.status(201).json({ message: `New message for \'${recipient}\' created.`})
  } else {
    return res.status(400).json({ message: 'Invalid message data received.'})
  }
})


module.exports = {
  createNewMessage,
}
