import { Todo } from "../models/Todo";
import { Subtask } from "../models/Subtask";

export class TodoStatusService {
    /**
     * Updates a todo's status based on the statuses of all its subtasks
     * @param todoId - The ID of the todo to update
     * @returns Promise<void>
     */
    static async updateTodoStatusFromSubtasks(todoId: number): Promise<void> {
        try {
            // Get all subtasks for this todo
            const subtasks = await Subtask.findAll({
                where: { todo_id: todoId },
                attributes: ["status"],
            });

            // Determine the appropriate todo status
            const newTodoStatus = this.determineParentStatus(
                subtasks.map((subtask) => subtask.status)
            );

            // Update the todo status
            await Todo.update(
                { status: newTodoStatus },
                { where: { id: todoId } }
            );
        } catch (error) {
            console.error(
                `Failed to update todo status for todo ${todoId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Determines the appropriate parent todo status based on subtask statuses
     * @param subtaskStatuses - Array of subtask status strings
     * @returns The appropriate parent status
     */
    private static determineParentStatus(
        subtaskStatuses: string[]
    ): "not_started" | "in_progress" | "on_hold" | "completed" {
        // If no subtasks, todo should be "not_started"
        if (subtaskStatuses.length === 0) {
            return "not_started";
        }

        const statusCounts = {
            not_started: 0,
            in_progress: 0,
            on_hold: 0,
            completed: 0,
        };

        // Count statuses
        subtaskStatuses.forEach((status) => {
            if (status in statusCounts) {
                statusCounts[status as keyof typeof statusCounts]++;
            }
        });

        const totalSubtasks = subtaskStatuses.length;

        // Rule 1: If all subtasks are completed, parent todo becomes completed
        if (statusCounts.completed === totalSubtasks) {
            return "completed";
        }

        // Rule 2: If all subtasks are not_started, parent todo becomes not_started
        if (statusCounts.not_started === totalSubtasks) {
            return "not_started";
        }

        // Rule 3: If any subtask is in_progress or on_hold, parent todo becomes in_progress
        // This covers:
        // - Any subtask changes from not_started to in_progress
        // - Any subtask changes from completed to another status (preventing completed parent)
        if (statusCounts.in_progress > 0 || statusCounts.on_hold > 0) {
            return "in_progress";
        }

        // Rule 4: Mixed states (not_started + completed) should result in in_progress
        // This handles cases where some subtasks are completed and others are not_started
        return "in_progress";
    }
}
