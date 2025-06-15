import { CategoryApi } from "@/data/category";
import { TCategory } from "@/types";
import { useEffect, useState } from "react";

export const useCategory = () => {
    const [categories, setCategories] = useState<Partial<TCategory>[]>([]);
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async (page = 1, limit = 10, search = "") => {
        const categoriesResponse = await CategoryApi.fetchAll({
            page,
            limit,
            search,
            include_todo_count: true,
            sort_by: "createdAt",
            sort_order: "DESC",
        });
        setCategories([
            ...categoriesResponse?.data?.categories?.map((item) => ({
                id: item.id,
                name: item.name,
                todo_count: item.todo_count || "",
            })),
        ]);
    };

    return {
        categories,
        fetchCategories,
    };
};
