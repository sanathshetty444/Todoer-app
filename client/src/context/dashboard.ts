import { createContext, useContext } from "react";
import { TODO_STATUS, TTodo } from "@/types";

interface DashboardContextType {
    fetchTodos: (
        page?: number,
        limit?: number,
        search?: string,
        status?: string
    ) => Promise<void>;
    editTodoFormContext: {
        title: string;
        description: string;
        category: string;
        tags: string[];
        todoId: number | null;
    };
    handleEditTodo: (todo: TTodo) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
);
