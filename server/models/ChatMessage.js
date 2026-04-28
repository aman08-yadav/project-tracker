const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: { type: String, default: '' },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: 2000,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
