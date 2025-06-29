const Project = require("../../models/Project")
const User = require("../../models/User")

exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

      if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "Comment text is required." });
  }

   try {
    const newComment = {
      user: req.user.id,
      text,
      date: new Date(),
    };

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    return res.status(200).json({ success: true, comment: newComment });
  }  catch (error) {
    console.error("❌ Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding comment.",
    });
  }

}