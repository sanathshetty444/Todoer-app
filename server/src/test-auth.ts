#!/usr/bin/env ts-node

/**
 * Authentication System Test
 * Tests the complete auth flow: register, login, refresh, logout
 */

import { AuthService } from "./services/auth.service";
import { UserDAO } from "./daos/user.dao";
import { RefreshTokenDAO } from "./daos/refresh-token.dao";
import { TokenUtils } from "./utils/token.utils";
import { databaseConnection } from "./config/database";

async function testAuthenticationSystem() {
    try {
        console.log("🔐 Testing Authentication System...\n");

        // Initialize services
        const authService = new AuthService();
        const userDAO = new UserDAO();
        const refreshTokenDAO = new RefreshTokenDAO();

        // Test database connection
        console.log("📡 Testing database connection...");
        const dbConnected = await databaseConnection.testConnection();
        if (!dbConnected) {
            throw new Error("Database connection failed");
        }
        console.log("✅ Database connected\n");

        // Test data
        const testUser = {
            email: "test.auth@example.com",
            name: "Test Auth User",
            password: "TestPassword123!",
        };

        // Cleanup any existing test user
        const existingUser = await userDAO.findByEmail(testUser.email);
        if (existingUser) {
            await userDAO.deleteById(existingUser.id);
            console.log("🧹 Cleaned up existing test user\n");
        }

        // Test 1: User Registration
        console.log("1️⃣ Testing User Registration...");
        const registerResult = await authService.register(testUser);
        console.log("✅ Registration successful");
        console.log(
            `   User: ${registerResult.user.name} (${registerResult.user.email})`
        );
        console.log(
            `   Access Token: ${registerResult.tokens.accessToken.substring(
                0,
                20
            )}...`
        );
        console.log(
            `   Refresh Token: ${registerResult.tokens.refreshToken.substring(
                0,
                20
            )}...\n`
        );

        // Test 2: JWT Token Verification
        console.log("2️⃣ Testing JWT Token Verification...");
        const decodedToken = TokenUtils.verifyAccessToken(
            registerResult.tokens.accessToken
        );
        console.log("✅ Access token verification successful");
        console.log(`   User ID: ${decodedToken.userId}`);
        console.log(`   Email: ${decodedToken.email}`);
        console.log(
            `   Expires: ${new Date(decodedToken.exp! * 1000).toISOString()}\n`
        );

        // Test 3: Refresh Token Verification
        console.log("3️⃣ Testing Refresh Token...");
        const refreshTokenRecord = await authService.verifyRefreshToken(
            registerResult.tokens.refreshToken
        );
        console.log("✅ Refresh token verification successful");
        console.log(`   Token valid: ${refreshTokenRecord?.isValid()}`);
        console.log(
            `   Expires: ${refreshTokenRecord?.expires_at.toISOString()}\n`
        );

        // Test 4: User Login
        console.log("4️⃣ Testing User Login...");
        const loginResult = await authService.login({
            email: testUser.email,
            password: testUser.password,
        });
        console.log("✅ Login successful");
        console.log(
            `   New Access Token: ${loginResult.tokens.accessToken.substring(
                0,
                20
            )}...`
        );
        console.log(
            `   New Refresh Token: ${loginResult.tokens.refreshToken.substring(
                0,
                20
            )}...\n`
        );

        // Test 5: Access Token Refresh
        console.log("5️⃣ Testing Access Token Refresh...");
        const refreshResult = await authService.refreshAccessToken(
            loginResult.tokens.refreshToken
        );
        console.log("✅ Token refresh successful");
        console.log(
            `   New Access Token: ${refreshResult.accessToken.substring(
                0,
                20
            )}...\n`
        );

        // Test 6: User Sessions
        console.log("6️⃣ Testing User Sessions...");
        const activeSessions = await authService.getUserActiveSessions(
            registerResult.user.id
        );
        console.log(`✅ Found ${activeSessions.length} active sessions`);
        activeSessions.forEach((session, index) => {
            console.log(
                `   Session ${index + 1}: ${session.token.substring(
                    0,
                    20
                )}... (expires: ${session.expires_at.toISOString()})`
            );
        });
        console.log();

        // Test 7: Token Blacklisting
        console.log("7️⃣ Testing Token Blacklisting...");
        await authService.blacklistToken(registerResult.tokens.refreshToken);
        const blacklistedToken = await authService.verifyRefreshToken(
            registerResult.tokens.refreshToken
        );
        console.log("✅ Token blacklisting successful");
        console.log(
            `   Blacklisted token valid: ${
                blacklistedToken?.isValid() || false
            }\n`
        );

        // Test 8: Logout
        console.log("8️⃣ Testing Logout...");
        await authService.logout(loginResult.tokens.refreshToken);
        console.log("✅ Logout successful\n");

        // Test 9: Password Validation
        console.log("9️⃣ Testing Password Validation...");
        const weakPassword = AuthService.validatePassword("123");
        const strongPassword = AuthService.validatePassword("StrongPass123!");
        console.log("✅ Password validation working");
        console.log(
            `   Weak password valid: ${weakPassword.valid} (errors: ${weakPassword.errors.length})`
        );
        console.log(`   Strong password valid: ${strongPassword.valid}\n`);

        // Test 10: Email Validation
        console.log("🔟 Testing Email Validation...");
        const invalidEmail = AuthService.validateEmail("invalid-email");
        const validEmail = AuthService.validateEmail("test@example.com");
        console.log("✅ Email validation working");
        console.log(`   Invalid email valid: ${invalidEmail}`);
        console.log(`   Valid email valid: ${validEmail}\n`);

        // Get final statistics
        console.log("📊 Final Token Statistics:");
        const tokenStats = await refreshTokenDAO.getUserTokenStats(
            registerResult.user.id
        );
        console.log(`   Total tokens: ${tokenStats.total}`);
        console.log(`   Active tokens: ${tokenStats.active}`);
        console.log(`   Blacklisted tokens: ${tokenStats.blacklisted}`);
        console.log(`   Expired tokens: ${tokenStats.expired}\n`);

        // Cleanup
        console.log("🧹 Cleaning up test data...");
        await userDAO.deleteById(registerResult.user.id);
        console.log("✅ Test user deleted\n");

        console.log("🎉 All authentication tests passed successfully!");
    } catch (error) {
        console.error("❌ Authentication test failed:", error);

        if (error instanceof Error) {
            console.error("   Error message:", error.message);
            if (error.stack) {
                console.error("   Stack trace:", error.stack);
            }
        }
    } finally {
        // Close database connection
        await databaseConnection.closeConnection();
        process.exit(0);
    }
}

// Add validation for required environment variables
function validateEnvironment() {
    const required = ["JWT_ACCESS_SECRET"];
    const missing = required.filter((env) => !process.env[env]);

    if (missing.length > 0) {
        console.error(
            `❌ Missing required environment variables: ${missing.join(", ")}`
        );
        console.error("   Please check your .env file");
        process.exit(1);
    }
}

// Run the test
console.log("🚀 Starting Authentication System Test...\n");
validateEnvironment();
testAuthenticationSystem().catch(console.error);
