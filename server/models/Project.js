const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  status: {
    type: String,
    enum: ["not started", "in progress", "completed", "on hold", "cancelled"],
    default: "not started"
  },
  deadline: {
    type: Date,
    required: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      date: { type: Date, default: Date.now }
    }
  ],
  attachments: [
    {
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  progress: {
    type: Number,
    default: 0, // % from 0 to 100
    min: 0,
    max: 100
  }
}, { timestamps: true });

mongoose.exports = mongoose.model("Project", ProjectSchema);