/**
 * Comprehensive Test// Test user credentials - password meets requirements
const TEST_USER = {
    email: 'tagtest@example.com',
    password: 'Password123!',
    name: 'Tag Test User'
}; for Tags Routes
 * Tests all tag management endpoints with authentication
 * 
 * Prerequisites:
 * 1. Server should be running on http://localhost:3000
 * 2. Database should be accessible and properly configured
 * 3. Test user credentials should be valid
 * 
 * Test Coverage:
 * - Tag creation with validation
 * - Tag listing with filters, pagination, and autocomplete
 * - Tag retrieval with todo associations
 * - Tag updates with duplicate validation
 * - Tag deletion with force options
 * - Authentication protection
 * - Error handling
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");

const BASE_URL = "http://localhost:3000";

// Test user credentials
const TEST_USER = {
    email: "test@example.com",
    password: "TestPassword123!",
    name: "Test User",
};

let authToken = "";
let testTags = [];
let testTodos = [];

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

        authToken = loginResponse.data.accessToken;
        console.log("✅ User authenticated successfully");

        // Create some test todos to associate with tags
        const todosToCreate = [
            {
                title: "Tagged Todo 1",
                description: "First todo for tag testing",
            },
            {
                title: "Tagged Todo 2",
                description: "Second todo for tag testing",
            },
            {
                title: "Untagged Todo",
                description: "This todo will remain untagged",
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
        // Delete test tags (this should also clean up associations)
        for (const tag of testTags) {
            try {
                await makeRequest("DELETE", `/api/tags/${tag.id}?force=true`);
            } catch (error) {
                // Tag might already be deleted
            }
        }

        // Delete test todos
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
 * Test: Create tags with various scenarios
 */
async function testCreateTags() {
    // Test 1: Create valid tag
    const tagData = { name: "Frontend" };
    const response = await makeRequest("POST", "/api/tags", tagData);

    if (!response.data.success || !response.data.tag) {
        throw new Error("Failed to create tag");
    }

    testTags.push(response.data.tag);

    if (response.data.tag.name !== tagData.name) {
        throw new Error("Tag name mismatch");
    }

    // Test 2: Create another tag
    const tagData2 = { name: "Backend" };
    const response2 = await makeRequest("POST", "/api/tags", tagData2);
    testTags.push(response2.data.tag);

    // Test 3: Create duplicate tag (should fail)
    const duplicateResponse = await makeRequest(
        "POST",
        "/api/tags",
        tagData,
        true
    );
    if (duplicateResponse.status !== 409) {
        throw new Error("Duplicate tag creation should fail with 409");
    }

    // Test 4: Create tag with invalid data
    const invalidResponse = await makeRequest(
        "POST",
        "/api/tags",
        { name: "" },
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid tag creation should fail with 400");
    }
}

/**
 * Test: List tags with various filters and options
 */
async function testListTags() {
    // Test 1: Basic listing
    const response = await makeRequest("GET", "/api/tags");

    if (!response.data.success || !Array.isArray(response.data.tags)) {
        throw new Error("Failed to list tags");
    }

    if (response.data.tags.length < 2) {
        throw new Error("Should have at least 2 test tags");
    }

    // Test 2: Pagination
    const paginatedResponse = await makeRequest(
        "GET",
        "/api/tags?page=1&limit=1"
    );
    if (paginatedResponse.data.tags.length !== 1) {
        throw new Error("Pagination not working correctly");
    }

    // Test 3: Search functionality
    const searchResponse = await makeRequest("GET", "/api/tags?search=Front");
    if (searchResponse.data.tags.length === 0) {
        throw new Error("Search should find Frontend tag");
    }

    // Test 4: Autocomplete mode
    const autocompleteResponse = await makeRequest(
        "GET",
        "/api/tags?autocomplete=true"
    );
    if (!autocompleteResponse.data.success) {
        throw new Error("Autocomplete mode failed");
    }

    // Autocomplete should return simplified format
    if (autocompleteResponse.data.tags[0].description !== undefined) {
        throw new Error("Autocomplete should return simplified tag format");
    }

    // Test 5: Include todo count
    const countResponse = await makeRequest(
        "GET",
        "/api/tags?include_todo_count=true"
    );
    if (!countResponse.data.success) {
        throw new Error("Include todo count failed");
    }

    // Test 6: Sorting
    const sortedResponse = await makeRequest(
        "GET",
        "/api/tags?sort_by=name&sort_order=DESC"
    );
    if (!sortedResponse.data.success) {
        throw new Error("Sorting failed");
    }
}

/**
 * Test: Get specific tag details
 */
async function testGetTag() {
    const testTag = testTags[0];

    // Test 1: Get tag without todos
    const response = await makeRequest("GET", `/api/tags/${testTag.id}`);

    if (!response.data.success || !response.data.tag) {
        throw new Error("Failed to get tag details");
    }

    if (response.data.tag.id !== testTag.id) {
        throw new Error("Tag ID mismatch");
    }

    // Test 2: Get tag with todos
    const responseWithTodos = await makeRequest(
        "GET",
        `/api/tags/${testTag.id}?include_todos=true`
    );
    if (!responseWithTodos.data.success) {
        throw new Error("Failed to get tag with todos");
    }

    // Test 3: Get non-existent tag
    const notFoundResponse = await makeRequest(
        "GET",
        "/api/tags/99999",
        null,
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Non-existent tag should return 404");
    }

    // Test 4: Get tag with invalid ID
    const invalidResponse = await makeRequest(
        "GET",
        "/api/tags/invalid",
        null,
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid tag ID should return 400");
    }
}

/**
 * Test: Update tags
 */
async function testUpdateTag() {
    const testTag = testTags[0];

    // Test 1: Valid update
    const updateData = { name: "Frontend Updated" };
    const response = await makeRequest(
        "PUT",
        `/api/tags/${testTag.id}`,
        updateData
    );

    if (!response.data.success || response.data.tag.name !== updateData.name) {
        throw new Error("Failed to update tag");
    }

    // Update our test data
    testTag.name = updateData.name;

    // Test 2: Update to duplicate name
    const duplicateResponse = await makeRequest(
        "PUT",
        `/api/tags/${testTag.id}`,
        { name: testTags[1].name },
        true
    );
    if (duplicateResponse.status !== 409) {
        throw new Error("Duplicate name update should fail with 409");
    }

    // Test 3: Update with invalid data
    const invalidResponse = await makeRequest(
        "PUT",
        `/api/tags/${testTag.id}`,
        { name: "" },
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid update should fail with 400");
    }

    // Test 4: Update non-existent tag
    const notFoundResponse = await makeRequest(
        "PUT",
        "/api/tags/99999",
        updateData,
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Updating non-existent tag should return 404");
    }
}

/**
 * Test: Tag-Todo associations
 */
async function testTagTodoAssociations() {
    const testTag = testTags[0];
    const testTodo = testTodos[0];

    // Test 1: Add tag to todo
    const addResponse = await makeRequest("PUT", `/api/todos/${testTodo.id}`, {
        title: testTodo.title,
        tag_ids: [testTag.id],
    });

    if (!addResponse.data.success) {
        throw new Error("Failed to add tag to todo");
    }

    // Test 2: Verify tag appears in todo
    const todoResponse = await makeRequest(
        "GET",
        `/api/todos/${testTodo.id}?include_tags=true`
    );
    if (
        !todoResponse.data.todo.tags ||
        todoResponse.data.todo.tags.length === 0
    ) {
        throw new Error("Tag not found in todo");
    }

    // Test 3: Verify todo appears in tag
    const tagResponse = await makeRequest(
        "GET",
        `/api/tags/${testTag.id}?include_todos=true`
    );
    if (
        !tagResponse.data.tag.todos ||
        tagResponse.data.tag.todos.length === 0
    ) {
        throw new Error("Todo not found in tag");
    }
}

/**
 * Test: Delete tags with different scenarios
 */
async function testDeleteTag() {
    // Create a tag for deletion testing
    const tagForDeletion = await makeRequest("POST", "/api/tags", {
        name: "ToDelete",
    });
    const deleteTagId = tagForDeletion.data.tag.id;

    // Test 1: Delete tag without associations
    const response = await makeRequest("DELETE", `/api/tags/${deleteTagId}`);
    if (!response.data.success) {
        throw new Error("Failed to delete tag without associations");
    }

    // Test 2: Try to delete tag with associations (should fail without force)
    const tagWithTodos = testTags[0]; // This should have todo associations from previous test
    const protectedResponse = await makeRequest(
        "DELETE",
        `/api/tags/${tagWithTodos.id}`,
        null,
        true
    );
    if (protectedResponse.status !== 409) {
        throw new Error("Deleting tag with todos should fail without force");
    }

    // Test 3: Force delete tag with associations
    const forceResponse = await makeRequest(
        "DELETE",
        `/api/tags/${tagWithTodos.id}?force=true`
    );
    if (!forceResponse.data.success) {
        throw new Error("Force delete should succeed");
    }

    if (forceResponse.data.removed_from_todos < 1) {
        throw new Error("Should have removed tag from todos");
    }

    // Remove from our test array
    testTags = testTags.filter((tag) => tag.id !== tagWithTodos.id);

    // Test 4: Delete non-existent tag
    const notFoundResponse = await makeRequest(
        "DELETE",
        "/api/tags/99999",
        null,
        true
    );
    if (notFoundResponse.status !== 404) {
        throw new Error("Deleting non-existent tag should return 404");
    }

    // Test 5: Delete with invalid ID
    const invalidResponse = await makeRequest(
        "DELETE",
        "/api/tags/invalid",
        null,
        true
    );
    if (invalidResponse.status !== 400) {
        throw new Error("Invalid tag ID should return 400");
    }
}

/**
 * Test: Authentication protection
 */
async function testAuthenticationProtection() {
    const originalToken = authToken;

    // Test 1: No token
    authToken = "";
    const noTokenResponse = await makeRequest("GET", "/api/tags", null, true);
    if (noTokenResponse.status !== 401) {
        throw new Error("No token should return 401");
    }

    // Test 2: Invalid token
    authToken = "invalid-token";
    const invalidTokenResponse = await makeRequest(
        "GET",
        "/api/tags",
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
    // Test 1: Very long tag name
    const longName = "A".repeat(256);
    const longNameResponse = await makeRequest(
        "POST",
        "/api/tags",
        { name: longName },
        true
    );
    // This might succeed or fail depending on database constraints

    // Test 2: Tag name with special characters
    const specialTag = await makeRequest("POST", "/api/tags", {
        name: "Tag & Special #1",
    });
    if (!specialTag.data.success) {
        throw new Error("Should handle special characters in tag names");
    }
    testTags.push(specialTag.data.tag);

    // Test 3: Unicode tag name
    const unicodeTag = await makeRequest("POST", "/api/tags", {
        name: "标签测试 🏷️",
    });
    if (!unicodeTag.data.success) {
        throw new Error("Should handle Unicode in tag names");
    }
    testTags.push(unicodeTag.data.tag);

    // Test 4: Empty pagination
    const emptyPageResponse = await makeRequest("GET", "/api/tags?page=1000");
    if (
        !emptyPageResponse.data.success ||
        emptyPageResponse.data.tags.length > 0
    ) {
        throw new Error("Empty page should return success with empty array");
    }
}

/**
 * Main test execution
 */
async function runAllTests() {
    console.log("🏷️  Starting Comprehensive Tags Routes Test Suite");
    console.log("=".repeat(50));

    let passedTests = 0;
    let totalTests = 0;

    try {
        await setup();

        const tests = [
            ["Create Tags", testCreateTags],
            ["List Tags", testListTags],
            ["Get Tag Details", testGetTag],
            ["Update Tags", testUpdateTag],
            ["Tag-Todo Associations", testTagTodoAssociations],
            ["Delete Tags", testDeleteTag],
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
            "\n🎉 All tests passed! Tags routes are working correctly."
        );
    } else {
        console.log(
            `\n⚠️  ${
                totalTests - passedTests
            } test(s) failed. Please review the implementation.`
        );
    }

    console.log("\n📝 Test Coverage:");
    console.log("   ✓ Tag CRUD operations");
    console.log("   ✓ Authentication protection");
    console.log("   ✓ Tag-Todo associations");
    console.log("   ✓ Pagination and filtering");
    console.log("   ✓ Autocomplete support");
    console.log("   ✓ Search functionality");
    console.log("   ✓ Force delete operations");
    console.log("   ✓ Error handling and validation");
    console.log("   ✓ Edge cases and special characters");
}

// Run the test suite
runAllTests().catch(console.error);
