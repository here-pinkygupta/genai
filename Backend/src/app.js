const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()


const allowedOrigins = [
    'https://genai-drab-beta.vercel.app',
    'https://animated-winner-7vp7vv747vv42rj9r-3000.app.github.dev',
    'https://animated-winner-7vp7vv747vv42rj9r-5173.app.github.dev'
];
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(cors({
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);
    console.log("Allowed:", allowedOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Handle OPTIONS preflight for ALL routes


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