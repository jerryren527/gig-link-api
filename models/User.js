const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  proposals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
  }],
  activeJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
  openJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
  postedRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
  }],
  receivedRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
  }],
  clientReviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  freelancerReviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  overallRating: {
    type: Number
  },
  sentMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  receivedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  skills: {
    type: [String]
  },
  biography: {
    type: String
  },
})

module.exports = mongoose.model('User', userSchema)

