import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLogin from "@/hooks/useLogin";

const Login = () => {
    const { handleLogin, isLoading, handleInputChange, loginData } = useLogin();

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-2 rounded-lg mr-2">
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
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            TODOER
                        </span>
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <p className="text-gray-600">Sign in to your account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={loginData.email}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                name="password"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:underline font-semibold"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
