const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clientUsername: {
    type: String,
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  freelancerUsername: {
    type: String,
  },
  skills: {
    type: [String],
  },
  price: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    default: 'Pending'
  },
  proposals: {
    type: [String],
  },
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Job', jobSchema)
