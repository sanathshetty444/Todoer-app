import { CategoryApi } from "@/data/category";
import { useCategory } from "./useCategory";
import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { TCategory } from "@/types";
import useToast from "./useToast";

export const useCategoryMaster = () => {
    const { categories, fetchCategories } = useCategory();
    const [name, setName] = useState("");
    const { toast } = useToast();
    const handleCreateCategory = async () => {
        try {
            if (!name.trim()) {
                console.error("Category name cannot be empty");
                return;
            }
            await CategoryApi.create({ name });
            await fetchCategories();
            setName("");
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    const handleSearchCategories = useCallback(
        debounce((searchTerm: string) => {
            fetchCategories(1, 10, searchTerm);
        }, 700),
        [fetchCategories]
    );

    const handleDeleteCategory = async (category: Partial<TCategory>) => {
        try {
            if (Number(category?.todo_count) > 0) {
                return toast.error(
                    "Cannot delete category with existing todos"
                );
            }
            await CategoryApi.delete(category?.id!);
            await fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return {
        categories,
        name,
        setName,
        handleSearchCategories,
        handleCreateCategory,
        handleDeleteCategory,
    };
};
