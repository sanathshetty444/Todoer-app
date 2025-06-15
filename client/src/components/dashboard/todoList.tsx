import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Edit, Trash2 } from "lucide-react";
import { TODO_STATUS, TSubtask, TTodo } from "@/types";
import SubtaskList from "./subtasksList";
import { useEffect, useMemo, useState } from "react";

const TodoAccordionList = ({ todos }: { todos: TTodo[] }) => {
    // Sample todo data

    // Status color mapping
    const getStatusColor = (
        status: (typeof TODO_STATUS)[keyof typeof TODO_STATUS]
    ) => {
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
    const formatStatus = (
        status: (typeof TODO_STATUS)[keyof typeof TODO_STATUS]
    ) => {
        return status.replace("_", " ").toUpperCase();
    };

    const [completedCount, setCompletedCount] = useState<number[]>([]);

    useEffect(() => {
        setCompletedCount([
            ...todos.map(
                (todo) =>
                    todo.subtasks?.reduce(
                        (count, subtask) =>
                            count +
                            (subtask.status === TODO_STATUS.COMPLETED ? 1 : 0),
                        0
                    ) || 0
            ),
        ]);
    }, [todos]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="w-full space-y-2">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-2"
                >
                    {todos.map((todo, index) => (
                        <AccordionItem
                            key={todo.id}
                            value={`todo-${todo.id}`}
                            className="border rounded-lg"
                        >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <div className="flex justify-items-start gap-4">
                                                <h3 className="font-semibold text-xl text-gray-900">
                                                    {todo.title}
                                                </h3>
                                                {todo.tags?.map((tag) => (
                                                    <Badge
                                                        key={tag?.id}
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 flex items-center gap-1 text-xs"
                                                    >
                                                        {tag?.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <p className="text-xl text-gray-500">
                                                {todo.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-xl text-gray-600 font-bold">
                                            {todo.category?.name}
                                        </span>
                                        <span className="text-xl text-gray-500">
                                            {completedCount[index]}/
                                            {todo?.subtasks?.length} completed
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
                                {/* Existing Subtasks */}
                                <SubtaskList
                                    todoId={todo.id}
                                    onStatusChange={(updatedSubTasks) => {
                                        const count = updatedSubTasks.reduce(
                                            (acc, subtask) =>
                                                acc +
                                                (subtask.status ===
                                                TODO_STATUS.COMPLETED
                                                    ? 1
                                                    : 0),
                                            0
                                        );
                                        completedCount[index] = count;
                                        setCompletedCount([...completedCount]);
                                    }}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default TodoAccordionList;
