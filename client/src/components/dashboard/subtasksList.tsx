import { TODO_STATUS, TSubtask } from "@/types";
import { Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSubtaskList } from "@/hooks/useSubtaskList";

function SubtaskList({ todoId }: { todoId: number }) {
    const [editingSubtask, setEditingSubtask] = useState<number | null>(null);

    const {
        subtasks,
        handleDeleteSubTask,
        handleSubtaskEdit,
        handleSubtaskStatusUpdate,
        handleAddSubTask,
        handleSubTaskChange,
        loading,
        newSubTask,
    } = useSubtaskList(todoId);
    return (
        <>
            <div className="space-y-3">
                <h4 className="font-medium text-xl text-gray-900">Subtasks</h4>

                {/* Add New Subtask Input */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                        placeholder="Add a new subtask"
                        value={newSubTask}
                        onChange={handleSubTaskChange}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleAddSubTask();
                            }
                        }}
                        className="flex-1 border-0 bg-transparent focus:ring-0 text-xl"
                    />
                    <Button
                        onClick={() => handleAddSubTask()}
                        size="sm"
                        className="bg-white hover:bg-blue-100 text-blue px-3"
                        disabled={!newSubTask?.trim() || loading}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {subtasks.map((subtask) => (
                <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                >
                    {editingSubtask === subtask.id ? (
                        <div className="flex-1 flex items-center gap-2">
                            <Input
                                defaultValue={subtask.title}
                                className="flex-1 border-0 bg-transparent focus:ring-0 text-xl"
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleSubtaskEdit({
                                            title: e.currentTarget.value,
                                            subtaskId: subtask.id!,
                                            todoId: subtask?.todo_id!,
                                        });
                                    }
                                }}
                                onBlur={(e) => {
                                    handleSubtaskEdit({
                                        title: e.currentTarget.value,
                                        subtaskId: subtask.id!,
                                        todoId: subtask?.todo_id!,
                                    });
                                    setEditingSubtask(null);
                                }}
                                autoFocus
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingSubtask(null)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            className={`flex-1 cursor-pointer text-xl ${
                                subtask.completed
                                    ? "line-through text-gray-500"
                                    : ""
                            }`}
                            onClick={() => setEditingSubtask(subtask?.id!)}
                        >
                            {subtask.title}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Select
                            value={subtask.status}
                            onValueChange={(value) =>
                                handleSubtaskStatusUpdate({
                                    status: value as TODO_STATUS,
                                    subtaskId: subtask.id!,
                                })
                            }
                        >
                            <SelectTrigger className="w-40 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(TODO_STATUS)
                                    .slice(1)
                                    .map((category) => (
                                        <SelectItem
                                            value={
                                                TODO_STATUS[
                                                    category as keyof typeof TODO_STATUS
                                                ]
                                            }
                                            key={category}
                                        >
                                            {category
                                                .toUpperCase()
                                                .split("_")
                                                .join(" ")}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubTask(subtask.id!)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            ))}
        </>
    );
}

export default SubtaskList;
