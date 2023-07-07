const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

// @desc Log in a user
// @route POST /auth/logIn
// @access Public
const logIn = asyncHandler( async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const foundUser = await User.findOne({ username }).exec()

  if (!foundUser) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) return res.status(401).json({ message: 'Unauthorized' })

  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "id": foundUser._id,
        "username": foundUser.username,
        "role": foundUser.role
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    // { expiresIn: '15s'}
    { expiresIn: '10m'}
  )

  const refreshToken = jwt.sign(
    { "username": foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    // { expiresIn: '30s'}
    { expiresIn: '1d'}
  )

  res.cookie('jwt', refreshToken, {
    httpOnly: true,   // accessible only be web server
    // secure: true,  //https
    sameSite: "None",
    // maxAge: 30 * 1000 // 30s
    maxAge: 24 * 60 * 60 * 100 // 1d
  })

  res.json({ accessToken })

})




// @desc Sign up a new user
// @route POST
// @access Public
const signUp = asyncHandler( async (req, res) => {
  const {username, password, firstName, lastName, role} = req.body

  const duplicate = await User.findOne({ username: username }).lean().exec()
  if (duplicate) {
    return res.status(409).json({ message: `Username ${username} already taken by another user.`})
  }
  
  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user document
  const newUser = new User({
    username,
    password: hashedPassword,
    firstName,
    lastName,
    role,
  });

  // Save the new user to the database
  const savedUser = await newUser.save();

  // console.log('User created:', savedUser);
  return res.status(201).json({ message: `User ${savedUser._id} created.`})
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      const foundUser = await User.findOne({ username: decoded.username }).exec()

      if (!foundUser) {
        return res.status(401).json({ message: 'Unauthorized' })
      } 

      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "id": foundUser._id,
            "username": foundUser.username,
            "role": foundUser.role
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        // { expiresIn: '15s' }
        { expiresIn: '15m' }
      )

      res.json({ accessToken })
    }
  )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204) //No content
  // res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None' })
  res.json({ message: 'Cookie cleared' })
}

module.exports = {
  logIn,
  signUp,
  refresh,
  logout
}
