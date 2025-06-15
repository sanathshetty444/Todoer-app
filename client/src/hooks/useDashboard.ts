import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { TodoApi } from "@/data/todo";
import { SubtasksApi } from "@/data/subtasks";
import { TTodo, TODO_STATUS, TTodosListResponse } from "@/types";
import { debounce, set } from "lodash";

export const useDashboard = () => {
    const user = localStorage.getItem("user");

    const navigate = useNavigate();
    const [showTodo, setShowTodo] = useState(false);
    const [search, setSearchTodo] = useState("");
    const [todos, setTodo] = useState<TTodosListResponse>();

    const [editTodoFormContext, setEditTodoFormContext] = useState<{
        title: string;
        description: string;
        category: string;
        tags: string[];
        todoId: number | null;
    }>({
        title: "",
        description: "",
        category: "",
        tags: [],
        todoId: null,
    });

    const [isEdit, setIsEdit] = useState(false);

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
        setIsEdit(false);
    };

    const handleEditTodo = (todo: TTodo) => {
        setEditTodoFormContext({
            title: todo.title,
            description: todo?.description || "",
            category: String(todo.category?.id || ""),
            tags: todo?.tags?.map((tag) => tag.name) || [],
            todoId: todo.id,
        });
        setIsEdit(true);
        handleOpenTodo();
    };

    const fetchTodos = async (
        page = 1,
        limit = 10,
        searchText = "",
        status = ""
    ) => {
        // This function would typically fetch todos from an API.
        // For now, we can just log the parameters.
        console.log("Fetching todos:", { page, limit, search });

        const todosRespones = await TodoApi.fetchAll({
            page,
            limit,
            search: searchText ?? search,
            status,
        });

        if (todosRespones?.data?.todos) {
            setTodo({ ...todosRespones.data });
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
        isEdit,
        editTodoFormContext,
        setShowTodo,
        handleCloseTodo,
        handleOpenTodo,
        handleSearch,
        handleFilter,
        fetchTodos,
        handleEditTodo,
    };
};
