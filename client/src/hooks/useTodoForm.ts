import { CategoryApi } from "@/data/category";
import { TagsApi } from "@/data/tags";
import { TodoApi } from "@/data/todo";
import { SubtasksApi } from "@/data/subtasks";
import { TCategory, TSubtask } from "@/types";
import { useEffect, useState } from "react";

export const useTodoForm = ({ handleClose }: { handleClose?: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [todoForm, setTodoForm] = useState<{
        title: string;
        description: string;

        category: string | null;
    }>({
        title: "",
        description: "",
        category: null,
    });

    const [subTasks, setSubTasks] = useState<Partial<TSubtask>[]>([
        {
            title: "",
        },
    ]);

    const [tags, setTags] = useState<string[]>([]);

    const [categories, setCategories] = useState<Partial<TCategory>[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (page = 1, limit = 10, search = null) => {
        const categoriesResponse = await CategoryApi.fetchAll({ page, limit });
        setCategories([
            ...categoriesResponse?.data?.categories?.map((item) => ({
                id: item.id,
                name: item.name,
            })),
        ]);
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTodoForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleAddSubTask = () => {
        subTasks.push({ title: "" });
        setSubTasks([...subTasks]);
    };

    const handleSubTaskChange = (index: number, title: string, status: any) => {
        setSubTasks((prev) => {
            prev[index] = {
                ...prev[index],
                title,
                status,
            };

            return [...prev];
        });
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

            const createTodo = await TodoApi.create({
                title,
                description,
                category_id: Number(category)!,
                tag_ids: tagIds,
            });

            const todoId = createTodo.data?.todo?.id;

            for (const subTask of subTasks) {
                if (subTask.title === "") continue;
                const subTaskResponse = await SubtasksApi.create({
                    todo_id: todoId!,
                    title: subTask.title || "",
                });
            }
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
        subTasks,
        tags,
        setTags,
        setTodoForm,
        handleClose,
        handleInputChange,
        handleSubmit,
        fetchCategories,
        handleAddSubTask,
        handleSubTaskChange,
    };
};
