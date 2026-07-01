const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()


const allowedOrigins = [
    'https://resume-analyzer-puce-eight.vercel.app',  // ← your vercel URL
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (Postman, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("❌ CORS blocked:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Handle OPTIONS preflight for ALL routes
app.options('*', cors());

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