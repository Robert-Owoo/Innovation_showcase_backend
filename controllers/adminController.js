const fs = require('fs').promises;
const path = require('path');

const PROJECTS_FILE = path.join(__dirname, '../data/projects.json');

// Get all pending projects
exports.getPendingProjects = async (req, res) => {
  try {
    const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
    const pendingProjects = projects.filter(project => project.status === 'pending');
    res.status(200).json(pendingProjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending projects" });
  }
};

// Approve a project
exports.approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    projects[projectIndex].status = 'approved';
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.status(200).json({ message: "Project approved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve project" });
  }
};

// Reject a project
exports.rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = JSON.parse(await fs.readFile(PROJECTS_FILE, 'utf8'));
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    projects[projectIndex].status = 'rejected';
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.status(200).json({ message: "Project rejected" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject project" });
  }
};
