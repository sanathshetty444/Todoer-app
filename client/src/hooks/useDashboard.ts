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

    const handleSubtaskEdit = async (props: {
        title: string;
        subtaskId: number;
        todoId: number;
    }) => {
        try {
            await SubtasksApi.update(props.subtaskId, {
                title: props.title,
            });

            // Refresh todos to get updated data
            fetchTodos(1, 10, search);
        } catch (error) {
            console.error("Error updating subtask:", error);
        }
    };

    const handleSubtaskStatusUpdate = async (props: {
        subtaskId: number;
        status: TODO_STATUS;
    }) => {
        try {
            await SubtasksApi.updateStatus(props.subtaskId, {
                status: props.status,
            });

            // Refresh todos to get updated data
            fetchTodos(1, 10, search);
        } catch (error) {
            console.error("Error updating subtask status:", error);
        }
    };

    const handleDeleteSubTask = async (subTaskId: number) => {
        try {
            await SubtasksApi.delete(subTaskId);

            // Refresh todos to get updated data
            fetchTodos(1, 10, search);
        } catch (error) {
            console.error("Error deleting subtask:", error);
        }
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
        handleSubtaskEdit,
        handleSubtaskStatusUpdate,
        handleDeleteSubTask,
    };
};
