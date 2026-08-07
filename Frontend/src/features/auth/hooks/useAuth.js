import { authContext } from "../states/auth.context";
import { login, register, logout, getme } from "../services/auth.api";
import { useContext, useEffect } from "react";

export const useAuth = () => {
    const context = useContext(authContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            if (!data.success) {
    alert(data.message);
    return;
}

setUser(data.user);
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            if (data) setUser(data.user);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);  // ← clear user state
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getAndSetUser = async () => {
            const response = await getme();
            if (!response) return;
            setUser(response.user);
            setLoading(false);
        };
        getAndSetUser();
    }, []);

    return { user, loading, handleLogin, handleLogout, handleRegister };
};