import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const useDashboard = () => {
    const user = localStorage.getItem("user");

    const navigate = useNavigate();
    const [showTodo, setShowTodo] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [navigate]);

    const handleOpenTodo = () => {
        setShowTodo(true);
    };
    const handleCloseTodo = () => {
        setShowTodo(false);
    };

    return { user, showTodo, setShowTodo, handleCloseTodo, handleOpenTodo };
};
