#!/bin/bash

# Replace YOUR_ACCESS_TOKEN with your actual access token from localStorage
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6InNhbmF0aHNoZXR0eTQ0NEBnbWFpbC5jb20iLCJuYW1lIjoic2FzIiwiaWF0IjoxNzQ5OTcxODQzLCJleHAiOjE3NDk5NzM2NDMsImF1ZCI6InRvZG8tYXBwLXVzZXJzIiwiaXNzIjoidG9kby1hcHAifQ.gAdCx286Lf3zZYZUPFOVHYcmt0SEo0ALDWbmpalJMl0"
API_BASE_URL="http://localhost:3000/api"

echo "Adding subtasks to todo_id=74..."

# Subtask 1: Research project requirements (completed)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Research project requirements",
    "todo_id": 74,
    "status": "completed"
  }'

echo -e "\n---\n"

# Subtask 2: Create project structure (completed)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Create project structure",
    "todo_id": 74,
    "status": "completed"
  }'

echo -e "\n---\n"

# Subtask 3: Set up development environment (in_progress)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Set up development environment",
    "todo_id": 74,
    "status": "in_progress"
  }'

echo -e "\n---\n"

# Subtask 4: Implement core features (not_started)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Implement core features",
    "todo_id": 74,
    "status": "not_started"
  }'

echo -e "\n---\n"

# Subtask 5: Write unit tests (not_started)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Write unit tests",
    "todo_id": 74,
    "status": "not_started"
  }'

echo -e "\n---\n"

# Subtask 6: Code review and optimization (not_started)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Code review and optimization",
    "todo_id": 74,
    "status": "not_started"
  }'

echo -e "\n---\n"

# Subtask 7: Deploy to staging (not_started)
curl -X POST "${API_BASE_URL}/subtasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "title": "Deploy to staging",
    "todo_id": 74,
    "status": "not_started"
  }'

echo -e "\nAll subtasks created for todo_id=74!"
