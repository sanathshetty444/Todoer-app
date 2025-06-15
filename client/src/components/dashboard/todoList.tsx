import React, { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Edit, Trash2, Plus, X } from "lucide-react";
import { TTodo } from "@/types";
import SubtaskList from "./subtasksList";

const TodoAccordionList = ({ todos }: { todos: TTodo[] }) => {
    // Sample todo data

    const [newSubtaskInputs, setNewSubtaskInputs] = useState({});

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "in_progress":
                return "bg-blue-100 text-blue-800";
            case "on_hold":
                return "bg-yellow-100 text-yellow-800";
            case "not_started":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Format status text
    const formatStatus = (status) => {
        return status.replace("_", " ").toUpperCase();
    };

    // Get completed subtasks count
    const getCompletedCount = (subtasks) => {
        const completed = subtasks.filter(
            (subtask) => subtask.completed
        ).length;
        return `${completed}/${subtasks.length}`;
    };

    // Toggle accordion expansion
    const toggleExpanded = (todoId) => {
        setTodos(
            todos.map((todo) =>
                todo.id === todoId
                    ? { ...todo, expanded: !todo.expanded }
                    : todo
            )
        );
    };

    // Handle subtask completion toggle
    const toggleSubtask = (todoId, subtaskId) => {
        setTodos(
            todos.map((todo) => {
                if (todo.id === todoId) {
                    return {
                        ...todo,
                        subtasks: todo.subtasks.map((subtask) =>
                            subtask.id === subtaskId
                                ? { ...subtask, completed: !subtask.completed }
                                : subtask
                        ),
                    };
                }
                return todo;
            })
        );
    };

    // Handle subtask status change
    const updateSubtaskStatus = (todoId, subtaskId, newStatus) => {
        setTodos(
            todos.map((todo) => {
                if (todo.id === todoId) {
                    return {
                        ...todo,
                        subtasks: todo.subtasks.map((subtask) =>
                            subtask.id === subtaskId
                                ? { ...subtask, status: newStatus }
                                : subtask
                        ),
                    };
                }
                return todo;
            })
        );
    };

    // Handle subtask edit
    const handleSubtaskEdit = (todoId, subtaskId, newTitle) => {
        setTodos(
            todos.map((todo) => {
                if (todo.id === todoId) {
                    return {
                        ...todo,
                        subtasks: todo.subtasks.map((subtask) =>
                            subtask.id === subtaskId
                                ? { ...subtask, title: newTitle }
                                : subtask
                        ),
                    };
                }
                return todo;
            })
        );
        setEditingSubtask(null);
    };

    // Handle adding new subtask
    const addSubtask = (todoId) => {
        const newSubtaskTitle = newSubtaskInputs[todoId]?.trim();
        if (!newSubtaskTitle) return;

        const newSubtask = {
            id: Date.now(), // Simple ID generation
            title: newSubtaskTitle,
            completed: false,
        };

        setNewSubtaskInputs({ ...newSubtaskInputs, [todoId]: "" });
    };

    // Handle delete subtask
    const deleteSubtask = (todoId, subtaskId) => {};

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="w-full space-y-2">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-2"
                >
                    {todos.map((todo) => (
                        <AccordionItem
                            key={todo.id}
                            value={`todo-${todo.id}`}
                            className="border rounded-lg"
                        >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <h3 className="font-semibold text-xl text-gray-900">
                                                {todo.title}
                                            </h3>
                                            <p className="text-xl text-gray-500">
                                                sasa
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-xl text-gray-600 font-bold">
                                            {todo.category?.name}
                                        </span>
                                        <span className="text-xl text-gray-500">
                                            {getCompletedCount(todo.subtasks)}{" "}
                                            completed
                                        </span>
                                        <Badge
                                            className={getStatusColor(
                                                todo.status
                                            )}
                                        >
                                            {formatStatus(todo.status)}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log(
                                                        "Edit todo:",
                                                        todo.id
                                                    );
                                                }}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log(
                                                        "Delete todo:",
                                                        todo.id
                                                    );
                                                }}
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-3">
                                    <h4 className="font-medium text-xl text-gray-900">
                                        Subtasks
                                    </h4>

                                    {/* Add New Subtask Input */}
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <Input
                                            placeholder="Add a new subtask"
                                            value={
                                                newSubtaskInputs?.[todo.id] ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setNewSubtaskInputs({
                                                    ...newSubtaskInputs,
                                                    [todo.id]: e.target.value,
                                                })
                                            }
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    addSubtask(todo.id);
                                                }
                                            }}
                                            className="flex-1 border-0 bg-transparent focus:ring-0 text-xl"
                                        />
                                        <Button
                                            onClick={() => addSubtask(todo.id)}
                                            size="sm"
                                            className="bg-white hover:bg-blue-100 text-blue px-3"
                                            disabled={
                                                !newSubtaskInputs[
                                                    todo.id
                                                ]?.trim()
                                            }
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Existing Subtasks */}
                                    <SubtaskList
                                        subtasks={todo?.subtasks || []}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default TodoAccordionList;
