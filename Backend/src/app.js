const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


const allowedOrigins = [
    "https://resume-analyzer-puce-eight.vercel.app",
    "https://resume-analyzer-4s2muzf6j-here-pinkyguptas-projects.vercel.app",
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
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