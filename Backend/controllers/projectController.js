// backend/controllers/projectController.js
const db = require("../db");

// Submit a project
exports.createProject = (req, res) => {
  const { user_id, title, description, category, tags, video_link } = req.body;

  if (!user_id || !title || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO projects (user_id, title, description, category, tags, video_link, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.query(sql, [user_id, title, description, category, tags, video_link], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to submit project" });
    res.status(201).json({ message: "Project submitted for review" });
  });
};

// Get all approved projects
exports.getApprovedProjects = (req, res) => {
  db.query("SELECT * FROM projects WHERE status = 'approved'", (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to fetch projects" });
    res.status(200).json(result);
  });
};

// Get a single project by ID
exports.getProjectById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM projects WHERE id = ?", [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(result[0]);
  });
};
