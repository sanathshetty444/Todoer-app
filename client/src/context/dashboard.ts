import { createContext, useContext } from "react";
import { TODO_STATUS } from "@/types";

interface DashboardContextType {
    fetchTodos: (
        page?: number,
        limit?: number,
        search?: string,
        status?: string
    ) => Promise<void>;
    handleSubtaskEdit: (props: {
        title: string;
        subtaskId: number;
        todoId: number;
    }) => void;
    handleSubtaskStatusUpdate: (props: {
        subtaskId: number;
        status: TODO_STATUS;
    }) => void;
    handleDeleteSubTask: (subTaskId: number) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
);

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error(
            "useDashboardContext must be used within a DashboardProvider"
        );
    }
    return context;
};
