const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
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
    required: true,
  },
  description: {
    type: String,
    required: true,
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
  }
},
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Request', requestSchema)
