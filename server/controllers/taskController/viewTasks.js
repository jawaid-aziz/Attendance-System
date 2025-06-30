const Task = require("../../models/Task");

exports.viewTasks = async (req, res) => {
  const userId = req.user.id; // coming from auth middleware (token decoded)

  try {
    const tasks = await Task.find({ assignedTo: userId })
      .populate("project", "name") // just populate the project name
      .populate("assignedTo", "firstName lastName") // populate user info
      .sort({ dueDate: 1 }); // optional: sort by upcoming deadline

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("❌ Error fetching assigned tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned tasks.",
    });
  }
};
