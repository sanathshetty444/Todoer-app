#!/usr/bin/env node

/**
 * Script to create todos using the Todo API
 * Usage: node create-todos.js [number_of_todos]
 * 
 * Default creates 10 todos with the provided access token and category ID
 */

const https = require('https');
const http = require('http');

// Configuration
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6InNhbmF0aHNoZXR0eTQ0NEBnbWFpbC5jb20iLCJuYW1lIjoic2FzIiwiaWF0IjoxNzQ5OTkzMTkxLCJleHAiOjE3NDk5OTQ5OTEsImF1ZCI6InRvZG8tYXBwLXVzZXJzIiwiaXNzIjoidG9kby1hcHAifQ.OURDULcKP9WezKqoKLgTCqBEFyLsbRKmorwrsvfEKTI";
const CATEGORY_ID = 2;
const API_BASE_URL = "http://localhost:3000";

// Sample todo data
const TODO_TEMPLATES = [
    {
        title: "Complete quarterly project report",
        description: "Prepare and submit the Q4 project status report with metrics and analysis",
        favorite: false
    },
    {
        title: "Review and update team documentation",
        description: "Go through all team processes and update outdated documentation",
        favorite: true
    },
    {
        title: "Plan next sprint activities",
        description: "Organize backlog items and plan upcoming sprint with team priorities",
        favorite: false
    },
    {
        title: "Conduct code review for new features",
        description: "Review pull requests and provide feedback on recent feature implementations",
        favorite: false
    },
    {
        title: "Prepare for client presentation",
        description: "Create slides and demo materials for upcoming client meeting",
        favorite: true
    },
    {
        title: "Update project dependencies",
        description: "Check for security updates and upgrade project dependencies to latest versions",
        favorite: false
    },
    {
        title: "Implement automated testing",
        description: "Set up unit tests and integration tests for the new modules",
        favorite: false
    },
    {
        title: "Database optimization and cleanup",
        description: "Analyze database performance and clean up unused data and indexes",
        favorite: false
    },
    {
        title: "Setup CI/CD pipeline improvements",
        description: "Enhance the deployment pipeline with better error handling and notifications",
        favorite: true
    },
    {
        title: "Research new technology stack",
        description: "Investigate potential tools and frameworks for future project improvements",
        favorite: false
    },
    {
        title: "User interface redesign planning",
        description: "Plan and design improvements for better user experience and accessibility",
        favorite: true
    },
    {
        title: "Security audit and penetration testing",
        description: "Conduct comprehensive security review and address any vulnerabilities",
        favorite: false
    },
    {
        title: "Performance monitoring setup",
        description: "Implement application performance monitoring and alerting systems",
        favorite: false
    },
    {
        title: "Team training session preparation",
        description: "Prepare materials for upcoming team training on new development practices",
        favorite: false
    },
    {
        title: "API documentation update",
        description: "Update API documentation with recent changes and add example requests",
        favorite: true
    }
];

/**
 * Make HTTP request to create a todo
 */
function createTodo(todoData) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            title: todoData.title,
            description: todoData.description,
            category_id: CATEGORY_ID,
            favorite: todoData.favorite,
            tag_ids: [] // No tags for simplicity
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/todos',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (res.statusCode === 201 && result.success) {
                        resolve(result);
                    } else {
                        reject(new Error(`API Error ${res.statusCode}: ${result.error || result.message || 'Unknown error'}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Create multiple todos with delay between requests
 */
async function createMultipleTodos(count) {
    console.log(`🚀 Starting to create ${count} todos...`);
    console.log(`📍 API Base URL: ${API_BASE_URL}`);
    console.log(`🏷️  Category ID: ${CATEGORY_ID}`);
    console.log(`🔑 Using Access Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
    console.log('');

    const results = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
        try {
            // Use template data in rotation
            const template = TODO_TEMPLATES[i % TODO_TEMPLATES.length];
            
            // Add variation to avoid duplicates
            const todoData = {
                ...template,
                title: `${template.title} #${i + 1}`,
                description: `${template.description} (Created: ${new Date().toISOString()})`
            };

            console.log(`📝 Creating todo ${i + 1}/${count}: "${todoData.title}"`);
            
            const result = await createTodo(todoData);
            results.push(result);
            
            console.log(`✅ Todo created successfully - ID: ${result.todo.id}`);

            // Add delay to avoid overwhelming the server
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

        } catch (error) {
            console.log(`❌ Failed to create todo ${i + 1}: ${error.message}`);
            errors.push({ index: i + 1, error: error.message });
        }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${results.length} todos`);
    console.log(`❌ Failed to create: ${errors.length} todos`);
    
    if (results.length > 0) {
        console.log('\n🎉 Created Todos:');
        results.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.todo.title} (ID: ${result.todo.id})`);
        });
    }

    if (errors.length > 0) {
        console.log('\n⚠️  Errors:');
        errors.forEach(error => {
            console.log(`   ${error.index}. ${error.error}`);
        });
    }

    return {
        success: results.length,
        failed: errors.length,
        results,
        errors
    };
}

/**
 * Test API connectivity
 */
async function testApiConnectivity() {
    console.log('🔍 Testing API connectivity...');
    
    try {
        // Test with a simple todo creation
        const testTodo = {
            title: "API Connectivity Test",
            description: "This is a test todo to verify API connectivity",
            favorite: false
        };

        const result = await createTodo(testTodo);
        console.log('✅ API connectivity test successful!');
        console.log(`   Created test todo with ID: ${result.todo.id}`);
        return true;
    } catch (error) {
        console.log('❌ API connectivity test failed!');
        console.log(`   Error: ${error.message}`);
        
        // Provide helpful troubleshooting tips
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   1. Make sure the server is running on localhost:3000');
        console.log('   2. Check if the access token is valid and not expired');
        console.log('   3. Verify that category ID 2 exists in your database');
        console.log('   4. Ensure the API endpoint /api/todos is accessible');
        
        return false;
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🎯 Todo Creation Script');
    console.log('========================\n');

    // Get number of todos to create from command line argument
    const todosToCreate = parseInt(process.argv[2]) || 10;
    
    if (todosToCreate <= 0 || todosToCreate > 100) {
        console.log('❌ Invalid number of todos. Please specify a number between 1 and 100.');
        process.exit(1);
    }

    // Test API connectivity first
    const isConnected = await testApiConnectivity();
    if (!isConnected) {
        console.log('\n❌ Cannot proceed due to connectivity issues.');
        process.exit(1);
    }

    console.log('\n🚀 Proceeding with todo creation...\n');

    // Create todos
    const summary = await createMultipleTodos(todosToCreate);

    console.log('\n✨ Script completed!');
    console.log(`📈 Success rate: ${((summary.success / todosToCreate) * 100).toFixed(1)}%`);
    
    if (summary.success > 0) {
        console.log('\n💡 You can now view these todos in your application or fetch them via:');
        console.log(`   GET ${API_BASE_URL}/api/todos?category_id=${CATEGORY_ID}`);
    }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n\n⏹️  Script interrupted by user. Exiting...');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('\n💥 Script failed with error:', error.message);
        process.exit(1);
    });
}
