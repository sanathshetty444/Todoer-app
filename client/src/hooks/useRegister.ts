import { AuthApi } from "@/data/login";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./useToast";

interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface UseRegisterReturn {
    isLoading: boolean;
    registerData: RegisterData;
    setRegisterData: React.Dispatch<React.SetStateAction<RegisterData>>;
    handleRegister: (e: React.FormEvent) => Promise<void>;
    onSignInClick: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    passwordsMatch: boolean;
    isFormValid: boolean;
}

export const useRegister = (): UseRegisterReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [registerData, setRegisterData] = useState<RegisterData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken) {
            // If access token exists, redirect to dashboard
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value } = e.target;
        setRegisterData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const passwordsMatch =
        registerData.password === registerData.confirmPassword;

    const isFormValid =
        registerData.name.trim() !== "" &&
        registerData.email.trim() !== "" &&
        registerData.password.length >= 6 &&
        passwordsMatch;

    const handleRegister = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!isFormValid) {
            toast.error("Please fill in all fields correctly.");
            return;
        }

        if (!passwordsMatch) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await AuthApi.register({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password,
            });

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
                toast.success(
                    "Account created successfully! Welcome to Todoer."
                );

                navigate("/dashboard"); // Redirect to dashboard
            }
        } catch (error: any) {
            console.error("Registration failed:", error);

            // Show specific error message from API or generic message
            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Registration failed. Please try again.";

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onSignInClick = (): void => {
        navigate("/login");
    };

    return {
        isLoading,
        registerData,
        setRegisterData,
        handleRegister,
        onSignInClick,
        handleInputChange,
        passwordsMatch,
        isFormValid,
    };
};

export default useRegister;
