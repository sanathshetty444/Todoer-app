#!/usr/bin/env ts-node

/**
 * Authentication API Demo
 * Demonstrates the complete authentication flow using HTTP requests
 */

import axios from "axios";

const BASE_URL = "http://localhost:3000";

interface RegisterResponse {
    user: {
        id: number;
        email: string;
        name: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

interface LoginResponse {
    user: {
        id: number;
        email: string;
        name: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

interface ProtectedResponse {
    message: string;
    user: {
        userId: number;
        email: string;
        name: string;
    };
}

async function demoAuthenticationAPI() {
    console.log("🚀 Starting Authentication API Demo...\n");

    try {
        // Test data
        const testUser = {
            email: "demo.api@example.com",
            name: "Demo API User",
            password: "DemoPassword123!",
        };

        // 1. Test Registration
        console.log("1️⃣ Testing User Registration...");
        try {
            const registerResponse = await axios.post<RegisterResponse>(
                `${BASE_URL}/api/auth/register`,
                testUser
            );
            console.log("✅ Registration successful");
            console.log(
                `   User: ${registerResponse.data.user.name} (${registerResponse.data.user.email})`
            );
            console.log(
                `   Access Token: ${registerResponse.data.tokens.accessToken.substring(
                    0,
                    20
                )}...`
            );
            console.log(
                `   Refresh Token: ${registerResponse.data.tokens.refreshToken.substring(
                    0,
                    20
                )}...\n`
            );

            // Store tokens for later use
            const accessToken = registerResponse.data.tokens.accessToken;
            const refreshToken = registerResponse.data.tokens.refreshToken;

            // 2. Test Protected Route (with token)
            console.log("2️⃣ Testing Protected Route (with token)...");
            const protectedResponse = await axios.get<ProtectedResponse>(
                `${BASE_URL}/api/protected`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log("✅ Protected route access successful");
            console.log(`   Message: ${protectedResponse.data.message}`);
            console.log(`   User: ${protectedResponse.data.user.email}\n`);

            // 3. Test Protected Route (without token)
            console.log("3️⃣ Testing Protected Route (without token)...");
            try {
                await axios.get(`${BASE_URL}/api/protected`);
                console.log("❌ Should have failed without token");
            } catch (error: any) {
                console.log("✅ Correctly blocked access without token");
                console.log(
                    `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
                );
            }

            // 4. Test Login
            console.log("4️⃣ Testing User Login...");
            const loginResponse = await axios.post<LoginResponse>(
                `${BASE_URL}/api/auth/login`,
                {
                    email: testUser.email,
                    password: testUser.password,
                }
            );
            console.log("✅ Login successful");
            console.log(
                `   New Access Token: ${loginResponse.data.tokens.accessToken.substring(
                    0,
                    20
                )}...`
            );
            console.log(
                `   New Refresh Token: ${loginResponse.data.tokens.refreshToken.substring(
                    0,
                    20
                )}...\n`
            );

            // 5. Test Token Refresh
            console.log("5️⃣ Testing Token Refresh...");
            const refreshResponse = await axios.post(
                `${BASE_URL}/api/auth/refresh`,
                {
                    refreshToken: loginResponse.data.tokens.refreshToken,
                }
            );
            console.log("✅ Token refresh successful");
            console.log(
                `   New Access Token: ${refreshResponse.data.accessToken.substring(
                    0,
                    20
                )}...\n`
            );

            // 6. Test Invalid Token Refresh
            console.log("6️⃣ Testing Invalid Token Refresh...");
            try {
                await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refreshToken: "invalid-token-12345",
                });
                console.log("❌ Should have failed with invalid token");
            } catch (error: any) {
                console.log("✅ Correctly rejected invalid refresh token");
                console.log(
                    `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
                );
            }

            // 7. Test Logout
            console.log("7️⃣ Testing Logout...");
            const logoutResponse = await axios.post(
                `${BASE_URL}/api/auth/logout`,
                {
                    refreshToken: loginResponse.data.tokens.refreshToken,
                }
            );
            console.log("✅ Logout successful");
            console.log(`   Message: ${logoutResponse.data.message}\n`);

            // 8. Test Using Refresh Token After Logout
            console.log("8️⃣ Testing Refresh Token After Logout...");
            try {
                await axios.post(`${BASE_URL}/api/auth/refresh`, {
                    refreshToken: loginResponse.data.tokens.refreshToken,
                });
                console.log("❌ Should have failed with blacklisted token");
            } catch (error: any) {
                console.log("✅ Correctly rejected blacklisted refresh token");
                console.log(
                    `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
                );
            }

            // 9. Test Invalid Login
            console.log("9️⃣ Testing Invalid Login...");
            try {
                await axios.post(`${BASE_URL}/api/auth/login`, {
                    email: testUser.email,
                    password: "wrong-password",
                });
                console.log("❌ Should have failed with wrong password");
            } catch (error: any) {
                console.log("✅ Correctly rejected invalid credentials");
                console.log(
                    `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
                );
            }

            // 10. Test Duplicate Registration
            console.log("🔟 Testing Duplicate Registration...");
            try {
                await axios.post(`${BASE_URL}/api/auth/register`, testUser);
                console.log("❌ Should have failed with duplicate email");
            } catch (error: any) {
                console.log("✅ Correctly rejected duplicate email");
                console.log(
                    `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
                );
            }
        } catch (error: any) {
            console.error(
                "❌ Registration failed:",
                error.response?.data || error.message
            );
        }

        console.log("🎉 Authentication API Demo completed successfully!");
        console.log("\n📋 Available Endpoints:");
        console.log("   POST /api/auth/register - Register new user");
        console.log("   POST /api/auth/login    - Login user");
        console.log("   POST /api/auth/refresh  - Refresh access token");
        console.log("   POST /api/auth/logout   - Logout user");
        console.log("   GET  /api/protected     - Protected route example");
    } catch (error) {
        console.error("❌ Demo failed:", error);
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await axios.get(BASE_URL);
        console.log("✅ Server is running\n");
        return true;
    } catch (error) {
        console.error(
            "❌ Server is not running. Please start the server first."
        );
        console.error("   Run: npm run dev\n");
        return false;
    }
}

// Run the demo
async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await demoAuthenticationAPI();
    }
}

main().catch(console.error);
