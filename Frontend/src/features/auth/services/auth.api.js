import axios from "axios"
console.log("API URL:", import.meta.env.VITE_API_URL)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

export async function register({username, email, password}){
    try{
        const response = await api.post("/auth/register", {
        username, email, password
    })

       return response.data
    }catch (err) {
      console.log(err.response?.data);
    throw err;
}
}

export async function login({ email, password }) {
     console.log("Sending login:", { email, password });
    try {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        return response.data;
    } catch(err){
    return {
        success: false,
        message: err.response?.data
    };
}
}

export async function logout(){
    try{
        const response = await api.get("/auth/logout")

       return response.data
    }catch(err){
        console.log(err)
    }
}

export async function getme(){
    try{
        const response = await api.get("/auth/get-me")

       return response.data
    }catch(err){
        console.log(err)
    }
}


