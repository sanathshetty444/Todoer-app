import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

function DashboardHeader({
    email,
    handleModalOpen,
}: {
    email: string;
    handleModalOpen: () => void;
}) {
    return (
        <div className="flex flex-col p-6 gap-4">
            <div className="text-black hover:bg-white/10 text-4xl font-bold">
                What do you want to do today?
            </div>
            <div className="text-black hover:bg-white/10 text-2xl ">
                Welcome back, {email}
            </div>
            <Card className="mt-4">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        {/* Primary Button - Add New Todo */}
                        <Button
                            onClick={handleModalOpen}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-xl"
                        >
                            Add New Todo
                        </Button>

                        {/* Secondary Button - Manage Categories */}
                        <Button
                            variant="outline"
                            className="px-6 py-3 border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 text-xl"
                        >
                            Manage Categories
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DashboardHeader;
