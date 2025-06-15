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

const Header = () => {
    const navigate = useNavigate();
    const { user, isLoading, handleLogout } = useHeader();

    return (
        <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="container px-4 py-4 w-[100%]">
                <div className="flex items-center justify-between w-[100%]">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9 11l3 3 8-8"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                    ry="2"
                                    stroke="white"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">TODOER</h1>
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

                    <div className="flex items-center gap-4">
                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 text-white hover:bg-white/10"
                                    >
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback className="bg-white/20 text-white text-sm">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:inline text-xl">
                                            {user.name}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        onClick={() => navigate("/dashboard")}
                                    >
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => navigate("/categories")}
                                    >
                                        Categories
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        {isLoading
                                            ? "Signing Out..."
                                            : "Sign Out"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
