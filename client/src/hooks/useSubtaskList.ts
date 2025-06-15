import { DashboardContext } from "@/context/dashboard";
import { SubtasksApi } from "@/data/subtasks";
import { TODO_STATUS, TSubtask } from "@/types";
import { useContext, useEffect, useState } from "react";

export const useSubtaskList = (todoId: number) => {
    const { fetchTodos } = useContext(DashboardContext)!;
    const [subtasks, setSubtasks] = useState<Partial<TSubtask>[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [newSubTask, setNewSubTask] = useState<string>("");
    const fetchSubtasks = async () => {
        setLoading(true);
        try {
            const response = await SubtasksApi.fetchAll({ todo_id: todoId });
            setSubtasks(response.data.subtasks);
            return response.data.subtasks;
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const handleSubtaskEdit = async (props: {
        title: string;
        subtaskId: number;
        todoId: number;
    }) => {
        try {
            setLoading(true);
            await SubtasksApi.update(props.subtaskId, {
                title: props.title,
            });
            await fetchTodos(); // Refresh subtasks to get updated data
        } catch (error) {
            console.error("Error updating subtask:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubtaskStatusUpdate = async (props: {
        subtaskId: number;
        status: TODO_STATUS;
    }) => {
        try {
            setLoading(true);

            await SubtasksApi.updateStatus(props.subtaskId, {
                status: props.status,
            });

            fetchTodos();
        } catch (error) {
            console.error("Error updating subtask status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubTask = async (subTaskId: number) => {
        try {
            setLoading(true);

            await SubtasksApi.delete(subTaskId);

            fetchTodos();
        } catch (error) {
            console.error("Error deleting subtask:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubTask = async () => {
        if (!newSubTask.trim()) return; // Prevent adding empty subtasks
        setLoading(true);
        try {
            await SubtasksApi.create({
                todo_id: todoId,
                title: newSubTask,
            });
            fetchTodos(); // Refresh subtasks to get updated data
        } catch (error) {
            console.error("Error adding subtask:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewSubTask(e.target.value);
    };
    useEffect(() => {
        if (todoId) {
            fetchSubtasks();
        }
    }, [todoId, fetchTodos]);

    return {
        subtasks,
        loading,
        newSubTask,
        fetchSubtasks,
        handleSubtaskEdit,
        handleSubtaskStatusUpdate,
        handleDeleteSubTask,
        handleAddSubTask,
        handleSubTaskChange,
    };
};
