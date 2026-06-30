require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "https://congenial-couscous-97j677647p67f7p6j-5173.app.github.dev",
  credentials: true,
}));

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post("/upload", upload.single("resume"), (req, res) => {
  console.log(req.file);
  console.log(req.body);

  res.json({
    success: true,
  });
});

app.listen(6000, () => console.log("Running on 6000"));