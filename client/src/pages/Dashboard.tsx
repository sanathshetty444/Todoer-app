import DashboardHeader from "@/components/dashboard/dashboardHeader";
import SearchTodo from "@/components/dashboard/searchTodo";
import TodoAccordionList from "@/components/dashboard/todoList";
import Header from "@/components/layout/Header";
import TodoFormModal from "@/components/todo/TodoForm";
import { DashboardContext } from "@/context/dashboard";
import { useDashboard } from "@/hooks/useDashboard";
import MainLayout from "@/layouts/main";

function Dashboard() {
    const {
        user,
        search,
        todos,
        showTodo,
        editTodoFormContext,
        isEdit,
        handleEditTodo,
        handleCloseTodo,
        handleOpenTodo,
        handleFilter,
        handleSearch,
        fetchTodos,
    } = useDashboard();
    const email = user ? JSON.parse(user).email : "";

    return (
        <MainLayout>
            <DashboardContext.Provider
                value={{
                    fetchTodos,
                    editTodoFormContext,
                    handleEditTodo,
                }}
            >
                <DashboardHeader
                    handleModalOpen={handleOpenTodo}
                    email={email}
                />
                {showTodo && (
                    <TodoFormModal
                        isEdit={isEdit}
                        handleClose={handleCloseTodo}
                        isOpen={showTodo}
                    />
                )}
                <SearchTodo
                    searchText={search}
                    handleFilter={handleFilter}
                    handleSearch={handleSearch}
                />
                <TodoAccordionList todoList={todos!} />
            </DashboardContext.Provider>
        </MainLayout>
    );
}

export default Dashboard;
