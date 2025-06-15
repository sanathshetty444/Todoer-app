import DashboardHeader from "@/components/dashboard/dashboardHeader";
import Header from "@/components/layout/Header";
import TodoFormModal from "@/components/todo/TodoForm";
import { useDashboard } from "@/hooks/useDashboard";
import React from "react";

function Dashboard() {
    const { user, handleCloseTodo, handleOpenTodo, showTodo } = useDashboard();
    const email = user ? JSON.parse(user).email : "";
    return (
        <>
            <Header />
            <DashboardHeader handleModalOpen={handleOpenTodo} email={email} />
            <TodoFormModal handleClose={handleCloseTodo} isOpen={showTodo} />
        </>
    );
}

export default Dashboard;
