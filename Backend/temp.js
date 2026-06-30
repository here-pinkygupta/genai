const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/upload", upload.single("resume"), (req, res) => {
  console.log(req.file);

  res.json({
    success: true,
    body: req.body,
    file: !!req.file,
  });
});

app.listen(5000, () => console.log("5000"));