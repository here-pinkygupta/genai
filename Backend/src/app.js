const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL, // must match frontend exactly, no trailing slash
    credentials: true
}))

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