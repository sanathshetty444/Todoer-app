import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const TagsInput = ({
    setTags,
    tags,
}: {
    tags: string[];
    setTags: (tags: string[]) => void;
}) => {
    const [tagInput, setTagInput] = useState("");

    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: number) => {
        tags.splice(tagToRemove, 1);
        console.log("Removed tag:", tagToRemove, "Updated tags:", tags);
        setTags([...tags]);
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
                Tags
            </Label>

            {/* Custom Input Container with Badges Inside */}
            <div className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 flex flex-wrap items-center gap-1">
                {/* Tags Display Inside Input */}
                {tags.map((tag, index) => (
                    <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 flex items-center gap-1 text-xs"
                    >
                        {tag}
                        <span onClick={() => removeTag(index)}>
                            <X className="h-3 w-3 cursor-pointer hover:text-blue-600" />
                        </span>
                    </Badge>
                ))}

                {/* Invisible Input for Typing */}
                <input
                    id="tags"
                    placeholder={
                        tags.length === 0 ? "Type a tag and press Enter" : ""
                    }
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                />
            </div>

            <p className="text-xs text-gray-500">Press Enter to add a tag</p>
        </div>
    );
};

export default TagsInput;
