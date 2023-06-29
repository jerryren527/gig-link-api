const mongoose = require('mongoose')

const proposalSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  skills: {
    type: [String],
  },
  price: {
    type: Number,
  },
  startDate: {
    type: Number,
  },
  dueDate: {
    type: Number,
  },
  status: {
    type: String,
    default: 'Pending'
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  }
},
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Proposal', proposalSchema)
