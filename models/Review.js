const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientUsername: {
    type: String,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerUsername: {
    type: String,
  },
  review: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
})

module.exports = mongoose.model('Review', ReviewSchema)
