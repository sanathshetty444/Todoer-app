import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useTodoForm } from "@/hooks/useTodoForm";
import TagsInput from "../dashboard/tags";

const TodoFormModal = ({
    isOpen,
    handleClose,
    isEdit = false,
}: {
    isEdit?: boolean;
    isOpen: boolean;
    handleClose: () => void;
}) => {
    const {
        categories,
        loading,
        todoForm,
        tags,
        setTags,
        setTodoForm,
        handleInputChange,
        handleSubmit,
    } = useTodoForm({ handleClose, isEdit });

    if (!isOpen) return null;
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[500px] p-0">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="text-xl font-semibold">
                            Add New Todo
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 pb-6 space-y-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="title"
                                className="text-sm font-medium"
                            >
                                Title
                            </Label>
                            <Input
                                onChange={handleInputChange}
                                id="title"
                                name="title"
                                value={todoForm.title}
                                placeholder="Enter todo title"
                                className="w-full"
                            />
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-sm font-medium"
                            >
                                Description
                            </Label>
                            <Textarea
                                onChange={handleInputChange}
                                id="description"
                                name="description"
                                value={todoForm.description}
                                placeholder="Enter todo description"
                                className="w-full min-h-[100px] resize-none"
                            />
                        </div>

                        {/* Category Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="category"
                                className="text-sm font-medium"
                            >
                                Category
                            </Label>
                            <Select
                                value={todoForm.category || ""}
                                onValueChange={(value) =>
                                    setTodoForm((prev) => ({
                                        ...prev,
                                        category: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="No Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            value={String(category.id)}
                                            key={category.id}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags Field */}
                        <TagsInput setTags={setTags} tags={tags} />

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                className="bg-blue-600 hover:bg-blue-600 text-white px-6"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {isEdit ? "Update Todo" : "Create Todo"}
                            </Button>
                            <Button
                                disabled={loading}
                                variant="outline"
                                onClick={handleClose}
                                className="px-6 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TodoFormModal;
