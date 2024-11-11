import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { login as performLogin } from "../service/Authenticate.js";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);

    const setCustomerFromToken = () => {
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setCustomer({
                    username: decodedToken.sub

                });
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem("access_token");
            }
        }
    };

    useEffect(() => {
        setCustomerFromToken();
    }, []);

    const login = async (emailAndPassword) => {
        try {
            const res = await performLogin(emailAndPassword);
            const token = res.data; // Assuming the token is returned as plain text

            if (!token) {
                throw new Error("No token received from server");
            }

            localStorage.setItem("access_token", token);

            const decodedToken = jwtDecode(token);
            const username = decodedToken.sub;

            setCustomer({
                username: username,
            });

            return {
                ...res,
                decodedToken: {
                    username,
                }
            };
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logOut = () => {
        localStorage.removeItem("access_token");
        setCustomer(null);
    };

    const isCustomerAuthenticated = () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            return false;
        }
        try {
            const { exp: expiration } = jwtDecode(token);
            if (Date.now() > expiration * 1000) {
                logOut();
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error checking authentication:", error);
            logOut();
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            customer,
            login,
            logOut,
            isCustomerAuthenticated,
            setCustomerFromToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;