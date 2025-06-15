import { AuthApi } from "@/data/login";
import { TUser } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./useToast";

interface UseHeaderReturn {
    user: TUser | null;
    isLoading: boolean;
    handleLogout: () => Promise<void>;
}

export const useHeader = (): UseHeaderReturn => {
    const [user, setUser] = useState<TUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Get user data on component mount
    useEffect(() => {
        const getUserData = async () => {
            try {
                // First check if user data exists in localStorage
                const storedUser = window.localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Also fetch fresh user data from API
                const response = await AuthApi.me();
                if (response.data.success) {
                    setUser(response.data.user);
                    window.localStorage.setItem(
                        "user",
                        JSON.stringify(response.data.user)
                    );
                }
            } catch (error) {
                console.error("Failed to get user data:", error);
                // If API call fails, clear stored data and redirect to login
                window.localStorage.removeItem("accessToken");
                window.localStorage.removeItem("user");
                navigate("/login");
            }
        };

        const accessToken = window.localStorage.getItem("accessToken");
        if (accessToken) {
            getUserData();
        } else {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = async (): Promise<void> => {
        setIsLoading(true);

        try {
            await AuthApi.logout();

            // Show success notification
            toast.success("Logged out successfully!", { autoClose: 2000 });
        } catch (error) {
            console.error("Logout failed:", error);

            // Show warning notification but continue with logout
            toast.warning(
                "Logout request failed, but you've been logged out locally."
            );
        } finally {
            // Clear all stored data
            window.localStorage.removeItem("accessToken");
            window.localStorage.removeItem("user");
            setUser(null);
            setIsLoading(false);

            // Redirect to login page
            navigate("/login");
        }
    };

    return {
        user,
        isLoading,
        handleLogout,
    };
};

export default useHeader;
