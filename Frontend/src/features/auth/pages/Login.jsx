import React from "react";
import "../auth.form.scss";
import {useNavigate, Link} from 'react-router';
import {useState} from 'react';
import { useAuth } from "../hooks/useAuth";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const {loading, handleLogin} = useAuth()


    const  handleSubmit =async (e)=>{
        e.preventDefault();
        await handleLogin({email, password})
       navigate("/")
    }

    if(loading){
        return(
            <main>
                <h1>Loading.....</h1>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email"  placeholder="Enter your email" 
                        onChange={(e) => {setEmail(e.target.value)}}/>
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password"
                        onChange={(e) => {setPassword(e.target.value)}}
                        />
                    </div>
                    <button type="submit" className='button primary-button'>Login</button>
                </form>

                <p>Don't have an account? <Link to='/register'>Register</Link></p>
            </div>
        </main>

    );
}

export default Login;