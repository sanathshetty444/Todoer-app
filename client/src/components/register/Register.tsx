import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useRegister from "@/hooks/useRegister";

const Register = () => {
    const {
        handleRegister,
        isLoading,
        handleInputChange,
        registerData,
        onSignInClick,
        passwordsMatch,
        isFormValid,
    } = useRegister();

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
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <p className="text-gray-600">
                        Join Todoer to organize your tasks
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                name="name"
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                value={registerData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={registerData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                name="password"
                                id="password"
                                type="password"
                                placeholder="Create a password (min. 6 characters)"
                                value={registerData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm Password
                            </Label>
                            <Input
                                name="confirmPassword"
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={registerData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                className={
                                    registerData.confirmPassword &&
                                    !passwordsMatch
                                        ? "border-red-500 focus-visible:ring-red-500"
                                        : ""
                                }
                            />
                            {registerData.confirmPassword &&
                                !passwordsMatch && (
                                    <p className="text-sm text-red-600">
                                        Passwords do not match
                                    </p>
                                )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            disabled={isLoading || !isFormValid}
                        >
                            {isLoading
                                ? "Creating Account..."
                                : "Create Account"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:underline font-semibold"
                                onClick={onSignInClick}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
