import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/layouts/main";
import { useCategoryMaster } from "@/hooks/useCategoryMaster";

const Categories = () => {
    const {
        categories,
        handleCreateCategory,
        handleDeleteCategory,
        handleSearchCategories,
        name,
        setName,
    } = useCategoryMaster();

    return (
        <MainLayout>
            <div className="p-6 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Category Master
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your todo categories
                    </p>
                </div>

                {/* Add New Category Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            Add New Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Category Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="category"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Category
                                    </Label>
                                    <Input
                                        id="category"
                                        placeholder="e.g., programming"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCreateCategory}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                >
                                    SUBMIT
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setName("")}
                                    className="px-6"
                                >
                                    RESET
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Categories
                        </h2>
                    </div>

                    <Card className="mt-4 w-[100%]">
                        <CardContent className="p-6">
                            <div className="flex gap-4 items-center">
                                {/* Search Input */}
                                <div className="flex-1/2">
                                    <Input
                                        onChange={(e) =>
                                            handleSearchCategories(
                                                e.target.value
                                            )
                                        }
                                        id="search"
                                        name="search"
                                        placeholder="Search todos..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Category Items */}
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <Card
                                key={category.id}
                                className="border border-gray-200"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {category.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                                {category?.todo_count}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        category
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Categories;
