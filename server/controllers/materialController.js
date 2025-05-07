// server/controllers/materialController.js
const path = require("path");
const { spawn } = require("child_process");

const generateQuestions = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const pythonPath = "python"; // or "python3"
    const scriptPath = path.join(__dirname, "../python/generate_questions.py");

    const py = spawn(pythonPath, [scriptPath]);

    let data = "";
    let error = "";

    py.stdout.on("data", (chunk) => {
        data += chunk.toString();
    });

    py.stderr.on("data", (chunk) => {
        error += chunk.toString();
    });

    py.on("close", (code) => {
        if (code !== 0 || error) {
            console.error("Python error:", error);
            return res.status(500).json({ message: "Failed to generate questions" });
        }

        try {
            const questions = JSON.parse(data);
            res.json({ questions });
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr, data);
            res.status(500).json({ message: "Invalid response from Python script" });
        }
    });

    // Send file buffer to Python via stdin
    py.stdin.write(req.file.buffer);
    py.stdin.end();
};

module.exports = { generateQuestions };
