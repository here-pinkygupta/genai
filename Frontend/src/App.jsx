import "./style.scss"
import {RouterProvider} from "react-router"
import {router} from "./app.routes.jsx"
import { Authprovider } from "./features/auth/states/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"


function App() {
  console.log("API URL:", import.meta.env.VITE_API_URL)

  return (
    <>
       <Authprovider>
          <InterviewProvider>
            <RouterProvider router={router} />
          </InterviewProvider>
       </Authprovider>
    </>
  )
}

export default App
