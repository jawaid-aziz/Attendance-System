const Task = require("../../models/Task")
const Project = require("../../models/Project")

exports.addTask = async (req, res) => {
  try {
    const {
      title,
      desc,
      assignedTo,
      project,
      status,
      priority,
      dueDate,
      completedAt,
    } = req.body;

    // Basic validation
    if (!title || !assignedTo || !project) {
      return res.status(400).json({
        success: false,
        message: "Title, assignedTo, and project are required fields.",
      });
    }

    // Create the task
    const newTask = await Task.create({
      title,
      desc,
      assignedTo,
      project,
      status,
      priority,
      dueDate,
      completedAt,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while creating task.",
    });
  }
};