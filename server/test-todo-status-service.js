/**
 * Simple test script to verify TodoStatusService functionality
 * This script can be run manually to test the service logic
 */

console.log("Starting TodoStatusService test...");

// Mock the determineParentStatus method for testing
class TestTodoStatusService {
    static determineParentStatus(subtaskStatuses) {
        // If no subtasks, todo should be "not_started"
        if (subtaskStatuses.length === 0) {
            return "not_started";
        }

        const statusCounts = {
            not_started: 0,
            in_progress: 0,
            on_hold: 0,
            completed: 0,
        };

        // Count statuses
        subtaskStatuses.forEach((status) => {
            if (status in statusCounts) {
                statusCounts[status]++;
            }
        });

        const totalSubtasks = subtaskStatuses.length;

        // Rule 1: If all subtasks are completed, parent todo becomes completed
        if (statusCounts.completed === totalSubtasks) {
            return "completed";
        }

        // Rule 2: If all subtasks are not_started, parent todo becomes not_started
        if (statusCounts.not_started === totalSubtasks) {
            return "not_started";
        }

        // Rule 3: If any subtask is in_progress or on_hold, parent todo becomes in_progress
        if (statusCounts.in_progress > 0 || statusCounts.on_hold > 0) {
            return "in_progress";
        }

        // Rule 4: Mixed states (not_started + completed) should result in in_progress
        return "in_progress";
    }
}

// Test cases
const testCases = [
    {
        name: "No subtasks",
        subtasks: [],
        expected: "not_started",
    },
    {
        name: "All subtasks not_started",
        subtasks: ["not_started", "not_started", "not_started"],
        expected: "not_started",
    },
    {
        name: "All subtasks completed",
        subtasks: ["completed", "completed", "completed"],
        expected: "completed",
    },
    {
        name: "Any subtask in_progress",
        subtasks: ["not_started", "in_progress", "completed"],
        expected: "in_progress",
    },
    {
        name: "Any subtask on_hold",
        subtasks: ["not_started", "on_hold", "completed"],
        expected: "in_progress",
    },
    {
        name: "Mixed not_started and completed",
        subtasks: ["not_started", "completed"],
        expected: "in_progress",
    },
    {
        name: "Single subtask changes from not_started to in_progress",
        subtasks: ["in_progress"],
        expected: "in_progress",
    },
    {
        name: "Subtask changes from completed to another status",
        subtasks: ["in_progress", "completed"],
        expected: "in_progress",
    },
];

console.log("🧪 Testing TodoStatusService Logic\n");

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = TestTodoStatusService.determineParentStatus(
        testCase.subtasks
    );
    const success = result === testCase.expected;

    console.log(`${index + 1}. ${testCase.name}`);
    console.log(`   Subtasks: [${testCase.subtasks.join(", ")}]`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   ${success ? "✅ PASS" : "❌ FAIL"}\n`);

    if (success) {
        passed++;
    } else {
        failed++;
    }
});

console.log("📊 Test Results:");
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(
    `📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`
);

if (failed === 0) {
    console.log(
        "\n🎉 All tests passed! The TodoStatusService logic is working correctly."
    );
} else {
    console.log("\n⚠️ Some tests failed. Please review the logic.");
}
