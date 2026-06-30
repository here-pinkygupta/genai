const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/upload", upload.single("resume"), (req, res) => {
  console.log(req.file);
  console.log(req.body);

  res.json({
    file: req.file,
    body: req.body,
  });
});

app.listen(4000, () => {
  console.log("Running on 4000");
});