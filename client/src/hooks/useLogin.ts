import { AuthApi } from "@/data/login";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./useToast";

interface LoginData {
    email: string;
    password: string;
}

interface UseLoginReturn {
    isLoading: boolean;
    loginData: LoginData;
    setLoginData: React.Dispatch<React.SetStateAction<LoginData>>;
    handleLogin: (e: React.FormEvent) => Promise<void>;
    onSignUpClick: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useLogin = (): UseLoginReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginData, setLoginData] = useState<LoginData>({
        email: "",
        password: "",
    });

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken) {
            // If access token exists, redirect to dashboard
            navigate("/dashboard");
        }
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value } = e.target;
        setLoginData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await AuthApi.login(loginData);
            if (response.data.success) {
                window.localStorage.setItem(
                    "accessToken",
                    response.data.accessToken
                );
                window.localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                // Show success notification
                toast.success("Login successful! Welcome back.");

                navigate("/dashboard"); // Redirect to dashboard or home page
            }
        } catch (error) {
            console.error("Login failed:", error);

            // Show error notification
            toast.error(
                "Login failed. Please check your credentials and try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const onSignUpClick = (): void => {
        navigate("/register");
    };

    return {
        isLoading,
        loginData,
        setLoginData,
        handleLogin,
        onSignUpClick,
        handleInputChange,
    };
};

export default useLogin;
