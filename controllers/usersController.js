const User = require('../models/User')
const asyncHandler = require('express-async-handler')   // prevents us from using so many try-catch blocks when using asyn methods
const bcrypt = require('bcrypt')


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

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, firstName, lastName, role } = req.body

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, Password, and Role are required."})
  }

  // .exec() is executes the query and returns a promise. That why we use await
  const duplicate = await User.findOne({ username }).lean().exec()

  if (duplicate) {
    return res.json(409).json({ message: "Duplicate username."})
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
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, role} = req.body

  if (!id || !username || !role) {
    res.status(400).json({ message: 'All fields expect password are required.'})
  }

  // no .lean() here because we want access to .save() method.
  const user = await User.findById(id).exec()

  if (!user) {
    res.status(400).json({ message: 'User not found.'})
  }

  const duplicate = await User.findOne({ username }).lean().exec()

  if (duplicate && duplicate?._id.toString() !== id) {
    res.status(409).json({ message: 'Duplicate username'})
  }

  user.username = username
  user.role = role

  if (password) {
    user.password = await bcrypt.hash(password, 10)
  }

  const updatedUser = await user.save()

  res.json({ message: `${updatedUser.username} updated`})
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
  createNewUser,
  updateUser,
  deleteUser
}