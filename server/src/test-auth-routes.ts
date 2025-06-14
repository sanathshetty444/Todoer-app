#!/usr/bin/env ts-node

/**
 * Complete Authentication Routes Test
 * Tests all the reorganized authentication endpoints
 */

import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

interface AuthResponse {
    success: boolean;
    message: string;
    user: {
        id: number;
        email: string;
        name: string;
    };
    accessToken: string;
}

interface UserProfileResponse {
    success: boolean;
    user: {
        id: number;
        email: string;
        name: string;
        createdAt?: string;
        updatedAt?: string;
    };
}

interface RefreshResponse {
    success: boolean;
    accessToken: string;
    message: string;
}

async function testCompleteAuthRoutes() {
    console.log("🚀 Starting Complete Authentication Routes Test...\n");

    try {
        // Test data
        const testUser = {
            email: "test.routes@example.com",
            name: "Test Routes User",
            password: "TestPassword123!",
        };

        let accessToken = "";
        let refreshToken = "";

        // 1. Test Health Check
        console.log("1️⃣ Testing API Health...");
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log("✅ API Health check successful");
        console.log(`   Status: ${healthResponse.data.message}`);
        console.log(`   Uptime: ${healthResponse.data.uptime}s\n`);

        // 2. Test User Registration
        console.log("2️⃣ Testing User Registration...");
        try {
            const registerResponse = await axios.post<AuthResponse>(
                `${BASE_URL}/auth/register`,
                testUser
            );
            console.log("✅ Registration successful");
            console.log(
                `   User: ${registerResponse.data.user.name} (${registerResponse.data.user.email})`
            );
            console.log(
                `   Access Token: ${registerResponse.data.accessToken.substring(
                    0,
                    20
                )}...`
            );

            accessToken = registerResponse.data.accessToken;

            // Extract refresh token from cookies (if using cookie-based)
            const cookies = registerResponse.headers["set-cookie"];
            if (cookies) {
                const refreshCookie = cookies.find((cookie) =>
                    cookie.includes("refreshToken=")
                );
                if (refreshCookie) {
                    const match = refreshCookie.match(/refreshToken=([^;]+)/);
                    if (match) {
                        refreshToken = match[1];
                        console.log(
                            `   Refresh Token (from cookie): ${refreshToken.substring(
                                0,
                                20
                            )}...`
                        );
                    }
                }
            }
            console.log();
        } catch (error: any) {
            if (
                error.response?.status === 500 &&
                error.response?.data?.message?.includes("already exists")
            ) {
                console.log(
                    "ℹ️  User already exists, proceeding with login...\n"
                );
            } else {
                throw error;
            }
        }

        // 3. Test User Login
        console.log("3️⃣ Testing User Login...");
        const loginResponse = await axios.post<AuthResponse>(
            `${BASE_URL}/auth/login`,
            {
                email: testUser.email,
                password: testUser.password,
            }
        );
        console.log("✅ Login successful");
        console.log(
            `   User: ${loginResponse.data.user.name} (${loginResponse.data.user.email})`
        );
        console.log(
            `   Access Token: ${loginResponse.data.accessToken.substring(
                0,
                20
            )}...`
        );

        accessToken = loginResponse.data.accessToken;

        // Extract refresh token from cookies
        const cookies = loginResponse.headers["set-cookie"];
        if (cookies) {
            const refreshCookie = cookies.find((cookie) =>
                cookie.includes("refreshToken=")
            );
            if (refreshCookie) {
                const match = refreshCookie.match(/refreshToken=([^;]+)/);
                if (match) {
                    refreshToken = match[1];
                    console.log(
                        `   Refresh Token (from cookie): ${refreshToken.substring(
                            0,
                            20
                        )}...`
                    );
                }
            }
        }
        console.log();

        // 4. Test Get User Profile
        console.log("4️⃣ Testing Get User Profile...");
        const profileResponse = await axios.get<UserProfileResponse>(
            `${BASE_URL}/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log("✅ Profile retrieval successful");
        console.log(`   User ID: ${profileResponse.data.user.id}`);
        console.log(`   Name: ${profileResponse.data.user.name}`);
        console.log(`   Email: ${profileResponse.data.user.email}\n`);

        // 5. Test Update User Profile
        console.log("5️⃣ Testing Update User Profile...");
        const updateResponse = await axios.put<UserProfileResponse>(
            `${BASE_URL}/auth/me`,
            {
                name: "Updated Test User",
                email: testUser.email, // Keep same email
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log("✅ Profile update successful");
        console.log(`   Updated Name: ${updateResponse.data.user.name}`);
        console.log(`   Email: ${updateResponse.data.user.email}\n`);

        // 6. Test Access Token Refresh (if we have refresh token)
        if (refreshToken) {
            console.log("6️⃣ Testing Access Token Refresh...");
            const refreshResponse = await axios.get<RefreshResponse>(
                `${BASE_URL}/auth/access-token`,
                {
                    headers: {
                        "x-refresh-token": refreshToken,
                    },
                }
            );
            console.log("✅ Token refresh successful");
            console.log(
                `   New Access Token: ${refreshResponse.data.accessToken.substring(
                    0,
                    20
                )}...`
            );
            console.log(`   Message: ${refreshResponse.data.message}\n`);

            // Update access token for future tests
            accessToken = refreshResponse.data.accessToken;
        } else {
            console.log(
                "6️⃣ Skipping Token Refresh (no refresh token available)\n"
            );
        }

        // 7. Test Protected Route Access
        console.log("7️⃣ Testing Protected Route Access...");
        const protectedResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log("✅ Protected route access successful");
        console.log(`   User: ${protectedResponse.data.user.email}\n`);

        // 8. Test Unauthorized Access
        console.log("8️⃣ Testing Unauthorized Access...");
        try {
            await axios.get(`${BASE_URL}/auth/me`);
            console.log("❌ Should have failed without token");
        } catch (error: any) {
            console.log("✅ Correctly blocked unauthorized access");
            console.log(
                `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
            );
        }

        // 9. Test Invalid Token
        console.log("9️⃣ Testing Invalid Token...");
        try {
            await axios.get(`${BASE_URL}/auth/me`, {
                headers: {
                    Authorization: "Bearer invalid-token-12345",
                },
            });
            console.log("❌ Should have failed with invalid token");
        } catch (error: any) {
            console.log("✅ Correctly rejected invalid token");
            console.log(
                `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
            );
        }

        // 10. Test Logout
        if (refreshToken) {
            console.log("🔟 Testing Logout...");
            const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {
                refreshToken: refreshToken,
            });
            console.log("✅ Logout successful");
            console.log(`   Message: ${logoutResponse.data.message}\n`);
        } else {
            console.log("🔟 Skipping Logout (no refresh token available)\n");
        }

        // 11. Test Password Validation
        console.log("1️⃣1️⃣ Testing Password Validation...");
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                email: "weak.password@example.com",
                name: "Weak Password User",
                password: "123",
            });
            console.log("❌ Should have failed with weak password");
        } catch (error: any) {
            console.log("✅ Correctly rejected weak password");
            console.log(
                `   Status: ${error.response?.status} - ${error.response?.data?.error}`
            );
            if (error.response?.data?.details) {
                console.log(
                    `   Details: ${error.response.data.details.join(", ")}`
                );
            }
            console.log();
        }

        // 12. Test Email Validation
        console.log("1️⃣2️⃣ Testing Email Validation...");
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                email: "invalid-email",
                name: "Invalid Email User",
                password: "ValidPassword123!",
            });
            console.log("❌ Should have failed with invalid email");
        } catch (error: any) {
            console.log("✅ Correctly rejected invalid email");
            console.log(
                `   Status: ${error.response?.status} - ${error.response?.data?.error}\n`
            );
        }

        console.log(
            "🎉 All authentication route tests completed successfully!"
        );
        console.log("\n📋 Available Authentication Endpoints:");
        console.log("   GET  /api/health            - API health check");
        console.log("   POST /api/auth/register     - User registration");
        console.log("   POST /api/auth/login        - User authentication");
        console.log("   POST /api/auth/logout       - User logout");
        console.log("   GET  /api/auth/me           - Get user profile");
        console.log("   PUT  /api/auth/me           - Update user profile");
        console.log("   GET  /api/auth/access-token - Refresh access token");
        console.log(
            "   POST /api/auth/refresh      - Alternative refresh endpoint"
        );
    } catch (error: any) {
        console.error(
            "❌ Authentication routes test failed:",
            error.response?.data || error.message
        );
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await axios.get("http://localhost:3000");
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

// Run the test
async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testCompleteAuthRoutes();
    }
}

main().catch(console.error);
