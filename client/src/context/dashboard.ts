import { createContext, useContext } from "react";
import { TODO_STATUS } from "@/types";

interface DashboardContextType {
    fetchTodos: (
        page?: number,
        limit?: number,
        search?: string,
        status?: string
    ) => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
);
