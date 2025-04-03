const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Ensure 'files' directory exists
const filesDir = path.join(__dirname, "files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

// Home route - List all tasks (files)
app.get("/", (req, res) => {
  fs.readdir(filesDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("Error loading tasks");
    }
    res.render("index", { files });
  });
});

// Create a new task (file)
app.post("/create", (req, res) => {
  const { title, detail } = req.body;

  if (!title || !detail) {
    return res.status(400).send("Title and detail are required");
  }

  // Sanitize filename (remove invalid characters)
  const fileName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "_") + ".txt";
  const filePath = path.join(filesDir, fileName);

  fs.writeFile(filePath, detail, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return res.status(500).send("Error creating task");
    }
    res.redirect("/");
  });
});

// Edit a task (file)
// Edit Task - Show Edit Page
app.get("/edit/:filename", (req, res) => {
  const filePath = path.join(filesDir, req.params.filename);

  fs.readFile(filePath, "utf-8", (err, filedata) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(404).send("Task not found");
    }
    res.render("edit", { filename: req.params.filename, filedata });
  });
});

// Handle Task Update
app.post("/update", (req, res) => {
  const { filename, newDetail } = req.body;
  const filePath = path.join(filesDir, filename);

  fs.writeFile(filePath, newDetail, (err) => {
    if (err) {
      console.error("Error updating file:", err);
      return res.status(500).send("Error updating task");
    }
    res.redirect("/");
  });
});




// View task details
app.get("/files/:filename", (req, res) => {
  const filePath = path.join(filesDir, req.params.filename);

  fs.readFile(filePath, "utf-8", (err, filedata) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(404).send("Task not found");
    }
    res.render("show", { filename: req.params.filename, filedata });
  });
});

// Delete a task (file)
app.delete("/delete", (req, res) => {
  const { file } = req.query;
  if (!file) {
    return res.status(400).json({ success: false, message: "Filename is required" });
  }

  const filePath = path.join(filesDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ success: false, message: "Error deleting task" });
      }
      res.json({ success: true });
    });
  } else {
    res.status(404).json({ success: false, message: "Task not found" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
