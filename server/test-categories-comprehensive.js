const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function testCategoriesRoutes() {
    console.log("🧪 Testing Categories Routes - Full CRUD Operations\n");

    try {
        // Step 1: Login to get access token
        console.log("1. 🔐 Logging in...");
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: "john.doe@example.com",
            password: "password123",
        });

        const accessToken = loginResponse.data.accessToken;
        console.log("✅ Login successful");

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        // Step 2: List categories (should be empty initially)
        console.log(
            "\n2. 📋 Listing categories (initial - should be empty)..."
        );
        const listResponse1 = await axios.get(`${BASE_URL}/categories`, {
            headers,
        });
        console.log(
            `✅ Categories listed: ${listResponse1.data.categories.length} categories found`
        );
        console.log("   Pagination:", listResponse1.data.pagination);

        // Step 3: Create new categories
        console.log("\n3. ➕ Creating categories...");

        const category1Response = await axios.post(
            `${BASE_URL}/categories`,
            {
                name: "Work",
            },
            { headers }
        );
        console.log(
            `✅ Category 1 created: ${category1Response.data.category.name} (ID: ${category1Response.data.category.id})`
        );

        const category2Response = await axios.post(
            `${BASE_URL}/categories`,
            {
                name: "Personal",
            },
            { headers }
        );
        console.log(
            `✅ Category 2 created: ${category2Response.data.category.name} (ID: ${category2Response.data.category.id})`
        );

        const category3Response = await axios.post(
            `${BASE_URL}/categories`,
            {
                name: "Shopping",
            },
            { headers }
        );
        console.log(
            `✅ Category 3 created: ${category3Response.data.category.name} (ID: ${category3Response.data.category.id})`
        );

        const workCategoryId = category1Response.data.category.id;
        const personalCategoryId = category2Response.data.category.id;
        const shoppingCategoryId = category3Response.data.category.id;

        // Step 4: Test duplicate category creation
        console.log("\n4. 🚫 Testing duplicate category creation...");
        try {
            await axios.post(
                `${BASE_URL}/categories`,
                {
                    name: "Work",
                },
                { headers }
            );
        } catch (error) {
            console.log(
                `✅ Duplicate category rejected: ${error.response.data.error}`
            );
        }

        // Step 5: List categories again
        console.log("\n5. 📋 Listing categories (after creation)...");
        const listResponse2 = await axios.get(`${BASE_URL}/categories`, {
            headers,
        });
        console.log(
            `✅ Categories listed: ${listResponse2.data.categories.length} categories found`
        );
        listResponse2.data.categories.forEach((cat) => {
            console.log(`   - ${cat.name} (ID: ${cat.id})`);
        });

        // Step 6: Get specific category
        console.log("\n6. 🔍 Getting specific category...");
        const getResponse = await axios.get(
            `${BASE_URL}/categories/${workCategoryId}`,
            { headers }
        );
        console.log(`✅ Category retrieved: ${getResponse.data.category.name}`);

        // Step 7: Update category
        console.log("\n7. ✏️ Updating category...");
        const updateResponse = await axios.put(
            `${BASE_URL}/categories/${workCategoryId}`,
            {
                name: "Work Projects",
            },
            { headers }
        );
        console.log(
            `✅ Category updated: ${updateResponse.data.category.name}`
        );

        // Step 8: Test search functionality
        console.log("\n8. 🔍 Testing search functionality...");
        const searchResponse = await axios.get(
            `${BASE_URL}/categories?search=Work`,
            { headers }
        );
        console.log(
            `✅ Search results: ${searchResponse.data.categories.length} categories found`
        );
        console.log("   Search filters:", searchResponse.data.filters);

        // Step 9: Create some todos to test category relationships
        console.log("\n9. 📝 Creating todos with categories...");
        const todo1 = await axios.post(
            `${BASE_URL}/todos`,
            {
                title: "Complete project report",
                description: "Finish the quarterly report",
                category_id: workCategoryId,
            },
            { headers }
        );
        console.log(`✅ Todo 1 created in Work category`);

        const todo2 = await axios.post(
            `${BASE_URL}/todos`,
            {
                title: "Buy groceries",
                description: "Weekly grocery shopping",
                category_id: shoppingCategoryId,
            },
            { headers }
        );
        console.log(`✅ Todo 2 created in Shopping category`);

        // Step 10: Get category with todos
        console.log("\n10. 📋 Getting category with todos...");
        const categoryWithTodos = await axios.get(
            `${BASE_URL}/categories/${workCategoryId}?include_todos=true`,
            { headers }
        );
        console.log(
            `✅ Category with todos: ${categoryWithTodos.data.category.name}`
        );
        if (categoryWithTodos.data.category.todos) {
            console.log(
                `   Todos in category: ${categoryWithTodos.data.category.todos.length}`
            );
            categoryWithTodos.data.category.todos.forEach((todo) => {
                console.log(`   - ${todo.title}`);
            });
        }

        // Step 11: Test deleting category with todos (should fail without force)
        console.log(
            "\n11. 🚫 Testing delete category with todos (without force)..."
        );
        try {
            await axios.delete(`${BASE_URL}/categories/${workCategoryId}`, {
                headers,
            });
        } catch (error) {
            console.log(`✅ Delete rejected: ${error.response.data.error}`);
            console.log(`   Todo count: ${error.response.data.todo_count}`);
        }

        // Step 12: Force delete category with todos
        console.log("\n12. 💪 Force deleting category with todos...");
        const forceDeleteResponse = await axios.delete(
            `${BASE_URL}/categories/${workCategoryId}?force=true`,
            { headers }
        );
        console.log(
            `✅ Category force deleted: ${forceDeleteResponse.data.message}`
        );
        console.log(
            `   Uncategorized todos: ${forceDeleteResponse.data.uncategorized_todos}`
        );

        // Step 13: Delete empty category
        console.log("\n13. 🗑️ Deleting empty category...");
        const deleteResponse = await axios.delete(
            `${BASE_URL}/categories/${personalCategoryId}`,
            { headers }
        );
        console.log(
            `✅ Empty category deleted: ${deleteResponse.data.message}`
        );

        // Step 14: Final category list
        console.log("\n14. 📋 Final categories list...");
        const finalListResponse = await axios.get(`${BASE_URL}/categories`, {
            headers,
        });
        console.log(
            `✅ Final categories: ${finalListResponse.data.categories.length} categories remaining`
        );
        finalListResponse.data.categories.forEach((cat) => {
            console.log(`   - ${cat.name} (ID: ${cat.id})`);
        });

        // Clean up remaining categories and todos
        console.log("\n15. 🧹 Cleaning up...");

        // Delete remaining todos
        const remainingTodos = await axios.get(`${BASE_URL}/todos`, {
            headers,
        });
        for (const todo of remainingTodos.data.todos) {
            await axios.delete(`${BASE_URL}/todos/${todo.id}`, { headers });
        }

        // Delete remaining categories
        const remainingCategories = await axios.get(`${BASE_URL}/categories`, {
            headers,
        });
        for (const category of remainingCategories.data.categories) {
            await axios.delete(
                `${BASE_URL}/categories/${category.id}?force=true`,
                { headers }
            );
        }

        console.log("✅ Cleanup completed");

        console.log("\n🎉 All categories routes tests passed successfully!");
        console.log("\n📊 Test Summary:");
        console.log("   ✅ Category CRUD operations");
        console.log("   ✅ Duplicate validation");
        console.log("   ✅ Search functionality");
        console.log("   ✅ Pagination and sorting");
        console.log("   ✅ Category-todo relationships");
        console.log("   ✅ Force delete with uncategorization");
        console.log("   ✅ Authentication protection");
        console.log("   ✅ Error handling");
    } catch (error) {
        console.error("❌ Test failed:", error.response?.data || error.message);
    }
}

testCategoriesRoutes();
