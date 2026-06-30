const {Router} = require("express")
const authController = require("../controllers/auth.control")
const authRouter = Router()
const authMiddleware = require("../middlewares/auth.middleware")

//api/auth/register
authRouter.post("/register", authController.userRegisterController)

//api/auth/login
authRouter.post("/login", authController.userLoginController)

//api/auth/logout-clear token from user and andd them in blacklist
authRouter.get("/logout", authController.userLogoutController)


//api/auth/getme-get current logged in user details
authRouter.get("/get-me", authMiddleware, authController.userGetmeController)


module.exports=authRouter