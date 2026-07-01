const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()


const allowedOrigins = [
  "http://localhost:5173",
  "https://resume-analyzer-oqswykkcf-here-pinkyguptas-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("🌍 Request Origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log("✅ Origin Allowed");
      callback(null, true);
    } else {
      console.log("❌ Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/test", (req, res) => {
    res.json({ message: "Backend is working" });
});
// require all the routes here
const authRouter = require('./routes/auth.routes')
const interviewRouter = require('./routes/interview.routes')



//using all routes
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports=app