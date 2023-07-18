const User = require('../models/User')
const asyncHandler = require('express-async-handler')   // prevents us from using so many try-catch blocks when using asyn methods
const bcrypt = require('bcrypt')
const Message = require('../models/Message')


// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean()

  if (!users?.length) {
    return res.status(400).json({ message: "No users found"})
  }

  res.json(users)
})

// @desc Get a user
// @route GET /users/:userid
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId
  const user = await User.findOne({ userId }).lean().exec()

  if (!user) {
    return res.status(400).json({ message: "No users found"})
  }

  res.json(user)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, firstName, lastName, role } = req.body

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, Password, and Role are required."})
  }

  const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()

  if (duplicate) {
    return res.status(400).json({ message: "Username taken!"})
  }

  const hashedPwd = await bcrypt.hash(password, 10)

  const userObject = { username, password: hashedPwd, firstName: firstName ? firstName : null, lastName: lastName ? lastName: null, role}

  const user = await User.create(userObject)

  if (user) {
    return res.status(201).json({ message: `New user ${username} created.`})
  } else {
    return res.status(400).json({ message: 'Invalid user data received.'})
  }
})

// @desc Update a user
// @route PUT /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { username, password, role} = req.body

  if (!req.body.id || !username || !role) {
    res.status(400).json({ message: 'Username and role are required.'})
  }

  const user = await User.findById(req.body.id).exec()

  if (!user) {
    res.status(400).json({ message: 'User not found.'})
  }

  const duplicate = await User.findOne({ username }).lean().exec()

  if (duplicate && duplicate?._id.toString() !== req.body.id) {
    res.status(409).json({ message: 'Duplicate username'})
  }

  const { id, ...otherProperties } = req.body

  // transform skills string into array
  let skills
  console.log('req.body.skills', req?.body?.skills)
  if (req?.body?.skills.length > 0) {
    console.log("🚀 ~ file: usersController.js:94 ~ updateUser ~ req?.body?.skills:", req?.body?.skills)
    
    skills = req?.body?.skills.split(',').map(skill => skill.trim());
  }
  

  if (skills) {
    Object.assign(user, { ...user, ...otherProperties, skills})
  } else {
    Object.assign(user, { ...user, ...otherProperties})
  }

  if (password) {
    user.password = await bcrypt.hash(password, 10)
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.username} updated`})
})

// @desc Removes a message from User.sentMessages or User.receivedMessages
// @route PATCH /users/inbox
// @access Private
const deleteMessage = asyncHandler(async (req, res) => {
  const { userId, messageId } = req.body

  const message = await Message.findById(messageId).exec()
  let result
  let messageType
  if (message.sender === userId) {
    messageType = 'Sent'
    result = await User.updateOne({ _id: userId }, { $pull: { sentMessages: messageId }})
  } else {
    messageType = 'Received'
    result = await User.updateOne({ _id: userId }, { $pull: { receivedMessages: messageId }})
  }
  
  if (result.modifiedCount === 0) {
    return res.status(204)
  } 
  return res.status(200).json({ message: `User ${userId}'s ${messageType} Message ${messageId} deleted.`})
})




// @desc Delete a user
// @route DELETE /user
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body

  if (!id) {
    req.status(400).json({ message: 'User ID required.'})
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: 'User not found.'})
  }

  const result = await user.deleteOne()

  res.json({message: `Username ${result.username} with ID ${result._id} deleted`})
})

module.exports = {
  getAllUsers,
  getUser,
  createNewUser,
  deleteMessage,
  updateUser,
  deleteUser
}