// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const {
  getPendingProjects,
  approveProject,
  rejectProject
} = require("../controllers/adminController");

router.get("/pending", getPendingProjects);
router.put("/approve/:id", approveProject);
router.put("/reject/:id", rejectProject);

module.exports = router;
