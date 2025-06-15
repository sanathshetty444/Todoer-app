import { CategoryApi } from "@/data/category";
import { TagsApi } from "@/data/tags";
import { TodoApi } from "@/data/todo";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "@/context/dashboard";
import useToast from "./useToast";
import { useCategory } from "./useCategory";

export const useTodoForm = ({
    isEdit,
    handleClose,
}: {
    isEdit?: boolean;
    handleClose?: () => void;
}) => {
    const { fetchTodos, editTodoFormContext } = useContext(DashboardContext)!;
    const [loading, setLoading] = useState(false);
    const initialTodoForm = {
        title: "",
        description: "",
        category: null,
        todoId: null,
    };
    const [todoForm, setTodoForm] = useState<{
        title: string;
        description: string;
        category: string | null;
        todoId: number | null;
    }>(initialTodoForm);

    const [tags, setTags] = useState<string[]>([]);

    const { categories, fetchCategories } = useCategory();
    const { toast } = useToast();
    useEffect(() => {
        console.log("useTodoForm mounted", isEdit, editTodoFormContext);
        if (isEdit && editTodoFormContext) {
            const { tags, ...rest } = editTodoFormContext;
            setTodoForm({
                ...rest,
            });
            setTags(tags || []);
        }
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTodoForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setLoading(true);
        // Handle form submission logic here
        console.log("Form submitted:", todoForm);

        try {
            const { category, description, title } = todoForm;
            const tagIds = [];
            for (const tag of tags) {
                const createTag = await TagsApi.create({
                    name: tag,
                });

                tagIds.push(createTag.data?.tag?.id);
            }

            if (isEdit && todoForm?.todoId) {
                await TodoApi.update(todoForm?.todoId, {
                    title,
                    description,
                    category_id: Number(category)!,
                    tag_ids: tagIds,
                });
                toast.success("Todo updated successfully!");
            } else {
                await TodoApi.create({
                    title,
                    description,
                    category_id: Number(category)!,
                    tag_ids: tagIds,
                });
                toast.success("Todo created successfully!");
            }

            fetchTodos();
            setTodoForm(initialTodoForm);
            handleClose?.();
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return {
        todoForm,
        loading,
        categories,
        tags,
        setTags,
        setTodoForm,
        handleClose,
        handleInputChange,
        handleSubmit,
        fetchCategories,
    };
};
