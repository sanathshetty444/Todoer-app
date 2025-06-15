import DashboardHeader from "@/components/dashboard/dashboardHeader";
import SearchTodo from "@/components/dashboard/searchTodo";
import TodoAccordionList from "@/components/dashboard/todoList";
import Header from "@/components/layout/Header";
import TodoFormModal from "@/components/todo/TodoForm";
import { DashboardContext } from "@/context/dashboard";
import { useDashboard } from "@/hooks/useDashboard";

function Dashboard() {
    const {
        user,
        search,
        todos,
        showTodo,
        handleCloseTodo,
        handleOpenTodo,
        handleFilter,
        handleSearch,
        fetchTodos,
        handleSubtaskEdit,
        handleSubtaskStatusUpdate,
        handleDeleteSubTask,
    } = useDashboard();
    const email = user ? JSON.parse(user).email : "";

    return (
        <DashboardContext.Provider
            value={{
                fetchTodos,
                handleSubtaskEdit,
                handleSubtaskStatusUpdate,
                handleDeleteSubTask,
            }}
        >
            <Header />
            <DashboardHeader handleModalOpen={handleOpenTodo} email={email} />
            <TodoFormModal handleClose={handleCloseTodo} isOpen={showTodo} />
            <SearchTodo
                searchText={search}
                handleFilter={handleFilter}
                handleSearch={handleSearch}
            />
            <TodoAccordionList todos={todos} />
        </DashboardContext.Provider>
    );
}

export default Dashboard;
