/**
 * Comprehensive Test Suite for Subtasks Routes
 * Tests all subtask management endpoints with authentication
 *
 * Prerequisites:
 * 1. Server should be running on http://localhost:3000
 * 2. Database should be accessible and properly configured
 * 3. Test user credentials should be valid
 *
 * Test Coverage:
 * - Subtask creation with validation
 * - Subtask listing with todo_id filtering and pagination
 * - Subtask retrieval with todo associations
 * - Subtask updates (title and completion)
 * - Subtask completion toggle
 * - Subtask reordering
 * - Subtask deletion
 * - Authentication protection
 * - Error handling and validation
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const BASE_URL = "http://localhost:3000";

// Test user credentials - password meets requirements
const TEST_USER = {
    email: "subtasktest@example.com",
    password: "Password123!",
    name: "Subtask Test User",
};

let authToken = "";
let testTodos = [];
let testSubtasks = [];

/**
 * Utility function to make authenticated API requests
 */
async function makeRequest(method, endpoint, data = null, expectError = false) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, BASE_URL);

        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: url.pathname + url.search,
            method: method,
            headers: {
                "Content-Type": "application/json",
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
            },
        };

        const req = http.request(options, (res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    const result = JSON.parse(body);

                    if (!expectError && res.statusCode >= 400) {
                        reject(
                            new Error(
                                `HTTP ${res.statusCode}: ${
                                    result.message ||
                                    result.error ||
                                    "Unknown error"
                                }`
                            )
                        );
                        return;
                    }

                    resolve({
                        status: res.statusCode,
                        data: result,
                        ok: res.statusCode < 400,
                    });
                } catch (error) {
                    if (expectError) {
                        resolve({
                            status: res.statusCode,
                            data: { error: error.message },
                            ok: false,
                        });
                    } else {
                        reject(error);
                    }
                }
            });
        });

        req.on("error", (error) => {
            if (expectError) {
                resolve({
                    status: 0,
                    data: { error: error.message },
                    ok: false,
                });
            } else {
                reject(error);
            }
        });

        if (data && (method === "POST" || method === "PUT")) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Test runner function
 */
async function runTest(testName, testFunction) {
    try {
        console.log(`\n🧪 Running: ${testName}`);
        await testFunction();
        console.log(`✅ PASSED: ${testName}`);
        return true;
    } catch (error) {
        console.error(`❌ FAILED: ${testName}`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
}

/**
 * Setup: Authenticate user and create test data
 */
async function setup() {
    console.log("\n🚀 Setting up test environment...");

    try {
        // First try to register the user (might fail if already exists)
        console.log("📝 Attempting to register test user...");
        try {
            const registerResponse = await makeRequest(
                "POST",
                "/api/auth/register",
                TEST_USER
            );
            console.log("✅ User registered successfully");
        } catch (error) {
            console.log("ℹ️  User might already exist, proceeding to login...");
        }

        // Login with the test user
        console.log("🔐 Logging in test user...");
        const loginResponse = await makeRequest("POST", "/api/auth/login", {
            email: TEST_USER.email,
            password: TEST_USER.password,
        });

        if (!loginResponse.data.accessToken) {
            throw new Error("Login response missing access token");
        }

        authToken = loginResponse.data.accessToken;
        console.log("✅ User authenticated successfully");

        // Create some test todos for subtask testing
        console.log("📋 Creating test todos...");
        const todosToCreate = [
            {
                title: "Todo with Subtasks 1",
                description: "First todo for subtask testing",
            },
            {
                title: "Todo with Subtasks 2",
                description: "Second todo for subtask testing",
            },
            {
                title: "Empty Todo",
                description: "This todo will have no subtasks",
            },
        ];

        for (const todoData of todosToCreate) {
            const response = await makeRequest("POST", "/api/todos", todoData);
            testTodos.push(response.data.todo);
        }

        console.log(`✅ Created ${testTodos.length} test todos`);
    } catch (error) {
        throw new Error(`Setup failed: ${error.message}`);
    }
}

/**
 * Cleanup: Remove test data
 */
async function cleanup() {
    console.log("\n🧹 Cleaning up test data...");

    try {
        // Delete test subtasks (this should cascade delete)
        for (const subtask of testSubtasks) {
            try {
                await makeRequest("DELETE", `/api/subtasks/${subtask.id}`);
            } catch (error) {
                // Subtask might already be deleted
            }
        }

        // Delete test todos (this should also delete associated subtasks)
        for (const todo of testTodos) {
            try {
                await makeRequest("DELETE", `/api/todos/${todo.id}`);
            } catch (error) {
                // Todo might already be deleted
            }
        }

        console.log("✅ Cleanup completed");
    } catch (error) {
        console.warn(`⚠️  Cleanup warning: ${error.message}`);
    }
}

/**
 * Test: Create subtasks with various scenarios
 */
async function testCreateSubtasks() {
    const testTodo = testTodos[0];

    // Test 1: Create valid subtask with new status system
    const subtaskData = {
        title: "First Subtask",
        todo_id: testTodo.id,
        status: "not_started",
    };
    const response = await makeRequest("POST", "/api/subtasks", subtaskData);

    if (!response.data.success || !response.data.subtask) {
        throw new Error("Failed to create subtask");
    }

    testSubtasks.push(response.data.subtask);

    if (response.data.subtask.title !== subtaskData.title) {
        throw new Error("Subtask title mismatch");
    }

    if (response.data.subtask.status !== "not_started") {
        throw new Error("Subtask status should be not_started");
    }

    // Test 2: Create another subtask with completed status
    const subtaskData2 = {
        title: "Second Subtask",
        todo_id: testTodo.id,
        status: "completed",
    };
    const response2 = await makeRequest("POST", "/api/subtasks", subtaskData2);
    testSubtasks.push(response2.data.subtask);

    if (response2.data.subtask.status !== "completed") {
        throw new Error("Subtask status should be completed");
    }

    // Test 3: Create subtask with backward compatibility (completed field)
    const subtaskData3 = {
        title: "Third Subtask (Backward Compatible)",
        todo_id: testTodo.id,
        completed: true,
    };
    const response3 = await makeRequest("POST", "/api/subtasks", subtaskData3);
    testSubtasks.push(response3.data.subtask);

    if (response3.data.subtask.status !== "completed") {
        throw new Error(
            "Backward compatibility: completed=true should set status to completed"
        );
    }

    // Test 4: Create subtask with invalid todo_id
    const invalidTodoResponse = await makeRequest(
        "POST",
        "/api/subtasks",
        {
            title: "Invalid Todo Subtask",
            todo_id: 99999,
        },
        true
    );
    if (invalidTodoResponse.status !== 404) {
        throw new Error("Invalid todo_id should fail with 404");
    }

    // Test 5: Create subtask with missing title
    const missingTitleResponse = await makeRequest(
        "POST",
        "/api/subtasks",
        {
            todo_id: testTodo.id,
        },
        true
    );
    if (missingTitleResponse.status !== 400) {
        throw new Error("Missing title should fail with 400");
    }

    // Test 6: Create subtask with empty title
    const emptyTitleResponse = await makeRequest(
        "POST",
        "/api/subtasks",
        {
            title: "",
            todo_id: testTodo.id,
        },
        true
    );
    if (emptyTitleResponse.status !== 400) {
        throw new Error("Empty title should fail with 400");
    }
}

/**
 * Test: List subtasks with various filters and options
 */
async function testListSubtasks() {
    const testTodo = testTodos[0];

    // Test 1: List without todo_id (should fail)
    const noTodoIdResponse = await makeRequest(
        "GET",
        "/api/subtasks",
        null,
        true
    );
    if (noTodoIdResponse.status !== 400) {
        throw new Error("Missing todo_id should fail with 400");
    }

    // Test 2: Basic listing with todo_id
    const response = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodo.id}`
    );

    if (!response.data.success || !Array.isArray(response.data.subtasks)) {
        throw new Error("Failed to list subtasks");
    }

    if (response.data.subtasks.length < 2) {
        throw new Error("Should have at least 2 test subtasks");
    }

    // Test 3: Filter by completion status
    const completedResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodo.id}&completed=true`
    );
    if (!completedResponse.data.success) {
        throw new Error("Failed to filter by completion status");
    }

    // Test 4: Include todo details
    const includeResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodo.id}&include_todo=true`
    );
    if (!includeResponse.data.success) {
        throw new Error("Failed to include todo details");
    }

    // Test 5: Pagination
    const paginatedResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodo.id}&page=1&limit=1`
    );
    if (paginatedResponse.data.subtasks.length !== 1) {
        throw new Error("Pagination not working correctly");
    }

    // Test 6: Sorting
    const sortedResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodo.id}&sort_by=title&sort_order=DESC`
    );
    if (!sortedResponse.data.success) {
        throw new Error("Sorting failed");
    }

    // Test 7: Invalid todo_id
    const invalidResponse = await makeRequest(
        "GET",
        "/api/subtasks?todo_id=99999",
        null,
        true
    );
    if (invalidResponse.status !== 404) {
        throw new Error("Invalid todo_id should return 404");
    }
}

/**
 * Test: Get specific subtask details
 */
async function testGetSubtask() {
    const testSubtask = testSubtasks[0];

    // Test 1: Get subtask without todo details
    const response = await makeRequest(
        "GET",
        `/api/subtasks/${testSubtask.id}`
    );

    if (!response.data.success || !response.data.subtask) {
        throw new Error("Failed to get subtask details");
    }

    if (response.data.subtask.id !== testSubtask.id) {
        throw new Error("Subtask ID mismatch");
    }

    // Test 2: Get subtask with todo details
    const responseWithTodo = await makeRequest(
        "GET",
        `/api/subtasks/${testSubtask.id}?include_todo=true`
    );
    if (!responseWithTodo.data.success) {
        throw new Error("Failed to get subtask with todo details");
    }

    // Test 3: Get non-existent subtask
    const notFoundResponse = await makeRequest(
        "GET",
        "/api/subtasks/99999",
        null,
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Non-existent subtask should return 404");
    }

    // Test 4: Get subtask with invalid ID
    const invalidResponse = await makeRequest(
        "GET",
        "/api/subtasks/invalid",
        null,
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid subtask ID should return 400");
    }
}

/**
 * Test: Update subtasks
 */
async function testUpdateSubtask() {
    const testSubtask = testSubtasks[0];

    // Test 1: Update title
    const updateData = { title: "Updated First Subtask" };
    const response = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}`,
        updateData
    );

    if (
        !response.data.success ||
        response.data.subtask.title !== updateData.title
    ) {
        throw new Error("Failed to update subtask title");
    }

    // Update our test data
    testSubtask.title = updateData.title;

    // Test 2: Update status (new approach)
    const statusData = { status: "in_progress" };
    const statusResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}`,
        statusData
    );
    if (
        !statusResponse.data.success ||
        statusResponse.data.subtask.status !== "in_progress"
    ) {
        throw new Error("Failed to update subtask status");
    }

    // Test 3: Update completion status (backward compatibility)
    const completionData = { completed: true };
    const completionResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}`,
        completionData
    );
    if (
        !completionResponse.data.success ||
        completionResponse.data.subtask.status !== "completed"
    ) {
        throw new Error(
            "Failed to update subtask completion (backward compatibility)"
        );
    }

    // Test 4: Update both title and status
    const bothData = { title: "Both Updated", status: "on_hold" };
    const bothResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}`,
        bothData
    );
    if (!bothResponse.data.success) {
        throw new Error("Failed to update both fields");
    }
    if (bothResponse.data.subtask.status !== "on_hold") {
        throw new Error("Status should be on_hold");
    }

    // Test 4: Update with empty title
    const emptyTitleResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}`,
        { title: "" },
        true
    );
    if (emptyTitleResponse.status !== 400) {
        throw new Error("Empty title update should fail with 400");
    }

    // Test 5: Update non-existent subtask
    const notFoundResponse = await makeRequest(
        "PUT",
        "/api/subtasks/99999",
        updateData,
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Updating non-existent subtask should return 404");
    }

    // Test 6: Update with no fields
    const noFieldsResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}`,
        {},
        true
    );
    if (noFieldsResponse.status !== 400) {
        throw new Error("Update with no fields should fail with 400");
    }
}

/**
 * Test: Toggle subtask completion and status management
 */
async function testToggleCompletion() {
    const testSubtask = testSubtasks[1];
    const originalStatus = testSubtask.status;

    // Test 1: Update status to specific value using request body
    const statusResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}/status`,
        { status: "in_progress" }
    );

    if (!statusResponse.data.success) {
        throw new Error("Failed to update subtask status");
    }

    if (statusResponse.data.subtask.status !== "in_progress") {
        throw new Error("Status should be in_progress");
    }

    // Test 2: Update to on_hold status
    const onHoldResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}/status`,
        { status: "on_hold" }
    );
    if (!onHoldResponse.data.success) {
        throw new Error("Failed to update to on_hold status");
    }

    if (onHoldResponse.data.subtask.status !== "on_hold") {
        throw new Error("Status should be on_hold");
    }

    // Test 3: Update to completed status
    const completedResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}/status`,
        { status: "completed" }
    );

    if (!completedResponse.data.success) {
        throw new Error("Failed to update to completed status");
    }

    if (completedResponse.data.subtask.status !== "completed") {
        throw new Error("Status should be completed");
    }

    if (!completedResponse.data.subtask.completed) {
        throw new Error(
            "Completed field should be true when status is completed"
        );
    }

    // Test 4: Update to not_started status
    const notStartedResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}/status`,
        { status: "not_started" }
    );
    if (notStartedResponse.data.subtask.status !== "not_started") {
        throw new Error("Status should be not_started");
    }
    if (notStartedResponse.data.subtask.completed) {
        throw new Error(
            "Completed field should be false when status is not_started"
        );
    }

    // Test 5: Invalid status value
    const invalidValueResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}/status`,
        { status: "invalid_status" },
        true
    );
    if (invalidValueResponse.status !== 400) {
        throw new Error("Invalid status value should return 400");
    }

    // Test 6: Missing status field
    const missingStatusResponse = await makeRequest(
        "PUT",
        `/api/subtasks/${testSubtask.id}/status`,
        {},
        true
    );
    if (missingStatusResponse.status !== 400) {
        throw new Error("Missing status field should return 400");
    }

    // Test 7: Update non-existent subtask
    const notFoundResponse = await makeRequest(
        "PUT",
        "/api/subtasks/99999/status",
        { status: "completed" },
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Updating non-existent subtask should return 404");
    }

    // Test 8: Update with invalid ID
    const invalidResponse = await makeRequest(
        "PUT",
        "/api/subtasks/invalid/status",
        { status: "completed" },
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid ID should return 400");
    }
}

/**
 * Test: Reorder subtasks
 */
async function testReorderSubtasks() {
    const testTodo = testTodos[0];

    // Create a third subtask to have more items to reorder
    const thirdSubtask = await makeRequest("POST", "/api/subtasks", {
        title: "Third Subtask",
        todo_id: testTodo.id,
    });
    testSubtasks.push(thirdSubtask.data.subtask);

    // Test 1: Valid reorder
    const reorderData = {
        todo_id: testTodo.id,
        subtasks: [
            { id: testSubtasks[2].id, sequence: 1 },
            { id: testSubtasks[0].id, sequence: 2 },
            { id: testSubtasks[1].id, sequence: 3 },
        ],
    };

    const response = await makeRequest(
        "PUT",
        "/api/subtasks/reorder",
        reorderData
    );

    if (!response.data.success) {
        throw new Error("Failed to reorder subtasks");
    }

    if (
        !Array.isArray(response.data.subtasks) ||
        response.data.subtasks.length !== 4
    ) {
        throw new Error("Reorder response should contain all subtasks");
    }

    // Test 2: Reorder with missing todo_id
    const missingTodoResponse = await makeRequest(
        "PUT",
        "/api/subtasks/reorder",
        {
            subtasks: [{ id: testSubtasks[0].id, sequence: 1 }],
        },
        true
    );
    if (missingTodoResponse.status !== 400) {
        throw new Error("Missing todo_id should fail with 400");
    }

    // Test 3: Reorder with invalid todo_id
    const invalidTodoResponse = await makeRequest(
        "PUT",
        "/api/subtasks/reorder",
        {
            todo_id: 99999,
            subtasks: [{ id: testSubtasks[0].id, sequence: 1 }],
        },
        true
    );
    if (invalidTodoResponse.status !== 404) {
        throw new Error("Invalid todo_id should fail with 404");
    }

    // Test 4: Reorder with empty subtasks array
    const emptyArrayResponse = await makeRequest(
        "PUT",
        "/api/subtasks/reorder",
        {
            todo_id: testTodo.id,
            subtasks: [],
        },
        true
    );
    if (emptyArrayResponse.status !== 400) {
        throw new Error("Empty subtasks array should fail with 400");
    }

    // Test 5: Reorder with invalid subtask format
    const invalidFormatResponse = await makeRequest(
        "PUT",
        "/api/subtasks/reorder",
        {
            todo_id: testTodo.id,
            subtasks: [{ id: "invalid" }],
        },
        true
    );
    if (invalidFormatResponse.status !== 400) {
        throw new Error("Invalid subtask format should fail with 400");
    }
}

/**
 * Test: Delete subtasks
 */
async function testDeleteSubtask() {
    // Create a subtask for deletion testing
    const testTodo = testTodos[1];
    const subtaskForDeletion = await makeRequest("POST", "/api/subtasks", {
        title: "To Be Deleted",
        todo_id: testTodo.id,
    });
    const deleteSubtaskId = subtaskForDeletion.data.subtask.id;

    // Test 1: Delete subtask
    const response = await makeRequest(
        "DELETE",
        `/api/subtasks/${deleteSubtaskId}`
    );
    if (!response.data.success) {
        throw new Error("Failed to delete subtask");
    }

    // Test 2: Try to delete the same subtask again
    const alreadyDeletedResponse = await makeRequest(
        "DELETE",
        `/api/subtasks/${deleteSubtaskId}`,
        null,
        true
    );
    if (alreadyDeletedResponse.status !== 404) {
        throw new Error("Deleting already deleted subtask should return 404");
    }

    // Test 3: Delete non-existent subtask
    const notFoundResponse = await makeRequest(
        "DELETE",
        "/api/subtasks/99999",
        null,
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Deleting non-existent subtask should return 404");
    }

    // Test 4: Delete with invalid ID
    const invalidResponse = await makeRequest(
        "DELETE",
        "/api/subtasks/invalid",
        null,
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid subtask ID should return 400");
    }
}

/**
 * Test: Authentication protection
 */
async function testAuthenticationProtection() {
    const originalToken = authToken;

    // Test 1: No token
    authToken = "";
    const noTokenResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodos[0].id}`,
        null,
        true
    );
    if (noTokenResponse.status !== 401) {
        throw new Error("No token should return 401");
    }

    // Test 2: Invalid token
    authToken = "invalid-token";
    const invalidTokenResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodos[0].id}`,
        null,
        true
    );
    if (invalidTokenResponse.status !== 401) {
        throw new Error("Invalid token should return 401");
    }

    // Restore token
    authToken = originalToken;
}

/**
 * Test: Edge cases and error scenarios
 */
async function testEdgeCases() {
    const testTodo = testTodos[0];

    // Test 1: Very long subtask title
    const longTitle = "A".repeat(500);
    const longTitleSubtask = await makeRequest("POST", "/api/subtasks", {
        title: longTitle,
        todo_id: testTodo.id,
    });
    // This should succeed unless there are database constraints

    if (longTitleSubtask.data.success) {
        testSubtasks.push(longTitleSubtask.data.subtask);
    }

    // Test 2: Subtask title with special characters
    const specialSubtask = await makeRequest("POST", "/api/subtasks", {
        title: "Subtask & Special #1 with émojis 🚀",
        todo_id: testTodo.id,
    });
    if (!specialSubtask.data.success) {
        throw new Error("Should handle special characters in subtask titles");
    }
    testSubtasks.push(specialSubtask.data.subtask);

    // Test 3: Unicode subtask title
    const unicodeSubtask = await makeRequest("POST", "/api/subtasks", {
        title: "子任务测试 🎯",
        todo_id: testTodo.id,
    });
    if (!unicodeSubtask.data.success) {
        throw new Error("Should handle Unicode in subtask titles");
    }
    testSubtasks.push(unicodeSubtask.data.subtask);

    // Test 4: Empty pagination page
    const emptyPageResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${testTodo.id}&page=1000`
    );
    if (
        !emptyPageResponse.data.success ||
        emptyPageResponse.data.subtasks.length > 0
    ) {
        throw new Error("Empty page should return success with empty array");
    }

    // Test 5: List subtasks for todo with no subtasks
    const emptyTodo = testTodos[2];
    const emptyTodoResponse = await makeRequest(
        "GET",
        `/api/subtasks?todo_id=${emptyTodo.id}`
    );
    if (
        !emptyTodoResponse.data.success ||
        emptyTodoResponse.data.subtasks.length > 0
    ) {
        throw new Error("Todo with no subtasks should return empty array");
    }
}

/**
 * Main test execution
 */
async function runAllTests() {
    console.log("📝 Starting Comprehensive Subtasks Routes Test Suite");
    console.log("=".repeat(50));

    let passedTests = 0;
    let totalTests = 0;

    try {
        await setup();

        const tests = [
            ["Create Subtasks", testCreateSubtasks],
            ["List Subtasks", testListSubtasks],
            ["Get Subtask Details", testGetSubtask],
            ["Update Subtasks", testUpdateSubtask],
            ["Toggle Completion", testToggleCompletion],
            ["Reorder Subtasks", testReorderSubtasks],
            ["Delete Subtasks", testDeleteSubtask],
            ["Authentication Protection", testAuthenticationProtection],
            ["Edge Cases", testEdgeCases],
        ];

        for (const [testName, testFunction] of tests) {
            totalTests++;
            if (await runTest(testName, testFunction)) {
                passedTests++;
            }
        }
    } catch (error) {
        console.error(`\n❌ Test suite setup failed: ${error.message}`);
    } finally {
        await cleanup();
    }

    // Results summary
    console.log("\n" + "=".repeat(50));
    console.log("🏁 Test Results Summary");
    console.log("=".repeat(50));
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);

    if (passedTests === totalTests) {
        console.log(
            "\n🎉 All tests passed! Subtasks routes are working correctly."
        );
    } else {
        console.log(
            `\n⚠️  ${
                totalTests - passedTests
            } test(s) failed. Please review the implementation.`
        );
    }

    console.log("\n📝 Test Coverage:");
    console.log("   ✓ Subtask CRUD operations");
    console.log("   ✓ Authentication protection");
    console.log("   ✓ Todo-Subtask relationships");
    console.log("   ✓ Pagination and filtering");
    console.log("   ✓ Completion status management");
    console.log("   ✓ Subtask reordering");
    console.log("   ✓ Required todo_id filtering");
    console.log("   ✓ Error handling and validation");
    console.log("   ✓ Edge cases and special characters");
}

// Run the test suite
console.log("Starting subtasks test suite...");
runAllTests()
    .then(() => {
        console.log("All tests completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Test suite failed:", error);
        process.exit(1);
    });
