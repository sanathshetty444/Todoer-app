import React from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"; // Changed from @radix-ui/react-select to ../ui/select
import { TODO_STATUS } from "@/types";

function SearchTodo({
    searchText,
    handleSearch,
    handleFilter,
}: {
    searchText: string;
    handleFilter: (status: string) => void;
    handleSearch: (query: string) => void;
}) {
    return (
        <div className="px-6">
            <Card className="mt-4 w-[100%]">
                <CardContent className="p-6">
                    <div className="flex gap-4 items-center">
                        {/* Search Input */}
                        <div className="flex-1/2">
                            <Input
                                onChange={(e) => handleSearch(e.target.value)}
                                id="search"
                                name="search"
                                value={searchText}
                                placeholder="Search todos..."
                                className="w-full"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="min-w-[180px]">
                            <Select
                                onValueChange={(value) => handleFilter(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(TODO_STATUS).map(
                                        (category) => (
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
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SearchTodo;
