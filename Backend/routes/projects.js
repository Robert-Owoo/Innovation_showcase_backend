// backend/routes/projects.js
const express = require("express");
const router = express.Router();
const {
  createProject,
  getApprovedProjects,
  getProjectById,
} = require("../controllers/projectController");

// Routes
router.post("/", createProject);
router.get("/", getApprovedProjects);
router.get("/:id", getProjectById);

module.exports = router;
