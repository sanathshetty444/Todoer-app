import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { TodoApi } from "@/data/todo";
import { SubtasksApi } from "@/data/subtasks";
import { TTodo, TODO_STATUS } from "@/types";
import { debounce } from "lodash";

export const useDashboard = () => {
    const user = localStorage.getItem("user");

    const navigate = useNavigate();
    const [showTodo, setShowTodo] = useState(false);
    const [search, setSearchTodo] = useState("");
    const [todos, setTodo] = useState<TTodo[]>([]);

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

    const fetchTodos = async (
        page = 1,
        limit = 10,
        search = "",
        status = ""
    ) => {
        // This function would typically fetch todos from an API.
        // For now, we can just log the parameters.
        console.log("Fetching todos:", { page, limit, search });

        const todosRespones = await TodoApi.fetchAll({
            page,
            limit,
            search,
            status,
        });

        if (todosRespones?.data?.todos) {
            setTodo([...todosRespones.data.todos]);
        }
    };
    const handleSearchDebounced = useCallback(debounce(fetchTodos, 700), []);

    const handleSearch = (query: string) => {
        setSearchTodo(query);
        handleSearchDebounced(1, 10, query);
    };

    const handleFilter = (status: string) => {
        if (status === "all") status = "";
        fetchTodos(1, 10, search, status);
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return {
        user,
        showTodo,
        todos,
        search,
        setShowTodo,
        handleCloseTodo,
        handleOpenTodo,
        handleSearch,
        handleFilter,
        fetchTodos,
    };
};
