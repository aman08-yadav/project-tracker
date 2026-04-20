const mongoose = require('mongoose');

const fileMetadataSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  storedName: {
    type: String,
    required: true,
    unique: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  description: {
    type: String,
    default: '',
    maxlength: 300,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FileMetadata', fileMetadataSchema);
