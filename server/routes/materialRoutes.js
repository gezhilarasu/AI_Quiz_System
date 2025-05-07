// server/routes/materialRoutes.js
const express = require("express");
const multer = require("multer");
const { generateQuestions } = require("../controllers/materialController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage(); // ✅ store in memory
const upload = multer({ storage });

router.post("/generate-questions", verifyToken, upload.single("material"), generateQuestions);

module.exports = router;
