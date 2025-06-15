import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useHeader } from "@/hooks/useHeader";
import { CheckSquare } from "lucide-react";

const Header = () => {
    const navigate = useNavigate();
    const { user, isLoading, handleLogout } = useHeader();

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <div className="flex  px-4 py-4 items-center justify-between w-[100%]">
                <div className="flex items-center gap-3">
                    <CheckSquare className="h-8 w-8" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        TODOER
                    </h1>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xl"
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10 text-xl"
                        onClick={() => navigate("/categories")}
                    >
                        Categories
                    </Button>
                </nav>

                <div className="flex items-center gap-4 bg-blue-300/20 rounded-full px-2 py-3">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 text-white hover:bg-white/10"
                                >
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-white/20 text-white text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline text-xl">
                                        {user.name}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleLogout}>
                                    {isLoading ? "Signing Out..." : "Sign Out"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
