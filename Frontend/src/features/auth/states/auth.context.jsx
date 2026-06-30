import { createContext , useState} from "react";


export const authContext = createContext();
//ts authprovider values user,setuser,loading,setloading is accessible to whole application
export const Authprovider =({children}) => {

    const [ user, setUser ] = useState(null);
    const [ loading , setLoading] = useState(false);

    

    return(
        <authContext.Provider value={{user, setUser, loading, setLoading}}>
            {children}
        </authContext.Provider>
    )
}