import DashboardHeader from "@/components/dashboard/dashboardHeader";
import SearchTodo from "@/components/dashboard/searchTodo";
import Header from "@/components/layout/Header";
import TodoFormModal from "@/components/todo/TodoForm";
import { useDashboard } from "@/hooks/useDashboard";
import React from "react";

function Dashboard() {
    const {
        user,
        handleCloseTodo,
        handleOpenTodo,
        showTodo,
        handleFilter,
        handleSearch,
        search,
        setShowTodo,
        todos,
    } = useDashboard();
    const email = user ? JSON.parse(user).email : "";
    return (
        <>
            <Header />
            <DashboardHeader handleModalOpen={handleOpenTodo} email={email} />
            <TodoFormModal handleClose={handleCloseTodo} isOpen={showTodo} />
            <SearchTodo
                searchText={search}
                handleFilter={handleFilter}
                handleSearch={handleSearch}
            />
        </>
    );
}

export default Dashboard;
