const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  senderUsername: {
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recipientUsername: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(Date.now()),
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('Message', MessageSchema)

