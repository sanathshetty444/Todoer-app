# Todo Application Server

A complete Node.js TypeScript server with PostgreSQL database, implementing a comprehensive todo application with users, categories, tags, and subtasks.

## ✅ COMPLETED FEATURES

### 🏗️ Project Setup

-   **Node.js + TypeScript**: Complete TypeScript setup with hot reloading
-   **Express Server**: REST API with proper middleware configuration
-   **PostgreSQL Integration**: Sequelize ORM with connection pooling
-   **Development Environment**: Hot reloading with nodemon, build scripts, and debugging support

### 🗄️ Database Architecture

-   **Complete Schema**: 6-table todo application database

    -   `users` - User authentication and profiles
    -   `categories` - User-specific todo categories
    -   `tags` - User-specific tags for todos
    -   `todos` - Main todo items with status and metadata
    -   `subtasks` - Nested tasks within todos
    -   `todo_tags` - Many-to-many relationship between todos and tags

-   **Migrations**: All database schema migrations completed
-   **Seeding**: Sample data with users, categories, tags, and todos
-   **Constraints**: Proper foreign keys, unique constraints, and indexes

### 🎯 Design Patterns Implemented

-   **Singleton Pattern**: Database connection and model registry
-   **Active Record Pattern**: Model methods for business logic
-   **Repository Pattern**: Centralized data access through models
-   **Factory Pattern**: Model creation and initialization

### 🔗 Model Associations

-   **User Relations**: One-to-many with categories, tags, and todos
-   **Category Relations**: Belongs to user, has many todos
-   **Tag Relations**: Belongs to user, many-to-many with todos
-   **Todo Relations**: Belongs to user and category, has many subtasks, many-to-many with tags
-   **Subtask Relations**: Belongs to todo

### 🚀 API Endpoints

-   `GET /` - Basic server health check
-   `GET /health` - Database connection status
-   `GET /api/users` - List all users
-   `GET /api/todos` - List todos with associations (user, category)
-   `GET /api/stats` - Database statistics (counts by table)

### 📊 Current Database State

```
Users: 3 (Admin User, John Doe, Jane Smith)
Categories: 3 (Work, Personal, Shopping)
Tags: 3 (urgent, important, later)
Todos: 3 (1 completed, 2 pending)
Subtasks: 0
```

---

✅ **Status**: Complete foundational setup with working API endpoints and fully seeded database.

## 🚀 Features

-   🔥 **TypeScript** for type safety and better developer experience
-   🚀 **Express.js** web framework with middleware
-   🗄️ **PostgreSQL** database with Sequelize ORM
-   🔄 **Hot reloading** with nodemon during development
-   📦 **Migration system** for database schema management
-   🌱 **Seeding system** for initial data setup
-   🏗️ **Design Patterns**: Singleton, Active Record, Repository patterns
-   🔐 **Password hashing** with bcrypt
-   ✅ **Health check** endpoints with database status
-   🎯 **TypeScript compilation** with proper build pipeline

## 📋 Prerequisites

Before running this project, make sure you have:

-   **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
-   **npm** or **yarn** package manager
-   **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)

### PostgreSQL Setup

#### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create a database user (optional, you can use the default user)
createuser -s postgres
```

#### Other Systems

-   **Windows**: Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
-   **Linux**: Use your distribution's package manager (apt, yum, etc.)

## 🛠️ Installation

1. **Clone and navigate to the project**:

```bash
cd server
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup environment variables**:

```bash
cp .env.example .env
```

4. **Configure your database** (edit `.env` file):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=idfy_development
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
```

5. **Initialize the database**:

```bash
# Create the database
npm run db:create

# Run migrations to create tables
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

## 🔧 Available Scripts

### Development

-   `npm run dev` - Start development server with hot reloading
-   `npm run build` - Build the TypeScript project
-   `npm start` - Start the production server
-   `npm run clean` - Clean the dist folder

### Database Operations

-   `npm run db:create` - Create the database
-   `npm run db:drop` - Drop the database
-   `npm run db:migrate` - Run pending migrations
-   `npm run db:migrate:undo` - Undo the last migration
-   `npm run db:migrate:undo:all` - Undo all migrations
-   `npm run db:seed` - Run all seeders
-   `npm run db:seed:undo` - Undo all seeders

### Code Generation

-   `npm run migration:generate -- add-column-to-users` - Generate a new migration
-   `npm run seed:generate -- demo-posts` - Generate a new seeder

## 🚀 Quick Start

1. **Start the development server**:

```bash
npm run dev
```

2. **Test the API**:

```bash
# Health check (includes database status)
curl http://localhost:3000/health

# Basic endpoint
curl http://localhost:3000
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Core Endpoints

#### `GET /`

Returns a welcome message with timestamp.

```json
{
    "message": "Hello World! TypeScript Node.js server is running!",
    "timestamp": "2025-06-13T15:34:10.580Z"
}
```

#### `GET /health`

Health check endpoint with database connection status.

```json
{
    "status": "OK",
    "uptime": 12.869823333,
    "timestamp": "2025-06-13T15:34:15.562Z",
    "database": "Connected"
}
```

## 🏗️ Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts          # Database connection singleton
│   │   └── config.ts           # Sequelize CLI configuration
│   ├── migrations/             # Database migrations
│   │   └── YYYYMMDD-*.ts      # Migration files
│   ├── models/
│   │   ├── BaseModel.ts       # Base model with common functionality
│   │   ├── User.ts            # User model example
│   │   └── index.ts           # Model registry (singleton)
│   ├── scripts/
│   │   └── init-db.ts         # Database initialization script
│   ├── seeders/               # Database seeders
│   │   └── YYYYMMDD-*.ts     # Seeder files
│   └── index.ts              # Main server file
├── dist/                     # Compiled JavaScript (generated)
├── .env                      # Environment variables
├── .env.example             # Environment template
├── .sequelizerc            # Sequelize CLI configuration
├── nodemon.json            # Nodemon configuration
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## 🎯 Design Patterns Used

### 1. Singleton Pattern

-   **Database Connection**: Ensures single database connection instance
-   **Model Registry**: Centralizes model management and associations

### 2. Active Record Pattern

-   **Base Model**: Common functionality for all models
-   **Model Methods**: Business logic embedded in model classes

### 3. Repository Pattern (Ready for implementation)

-   Structure prepared for repository layer abstraction

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Security Features

-   **Password Hashing**: Using bcrypt with salt rounds of 12
-   **Email Validation**: Built-in email format validation
-   **Input Sanitization**: Automatic data sanitization through Sequelize
-   **Environment Variables**: Sensitive data stored in environment variables

## 🌱 Database Seeding

The project includes sample data for development:

-   **Admin User**: `admin@idfy.com` / `password123`
-   **Test Users**: `john.doe@example.com`, `jane.smith@example.com`

## 📊 Model Examples

### User Model Features

```typescript
// Find user by email
const user = await User.findByEmail("admin@idfy.com");

// Verify password
const isValid = await user.verifyPassword("password123");

// Get public fields (excludes password)
const publicData = user.getPublicFields();

// Update last login
await user.updateLastLogin();
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check if PostgreSQL is running
brew services list | grep postgres

# Start PostgreSQL if not running
brew services start postgresql

# Verify connection
psql -h localhost -U postgres -d postgres
```

#### Migration Errors

```bash
# Reset migrations (⚠️ This will lose data)
npm run db:migrate:undo:all
npm run db:migrate

# Check migration status
npx sequelize-cli db:migrate:status
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

## 🚧 Development Workflow

1. **Create a new migration**:

```bash
npm run migration:generate -- add-new-column
```

2. **Edit the migration file** in `src/migrations/`

3. **Run the migration**:

```bash
npm run db:migrate
```

4. **Update your model** in `src/models/`

5. **Test your changes**:

```bash
npm run dev
```

## 📈 Production Deployment

1. **Build the project**:

```bash
npm run build
```

2. **Set production environment variables**
3. **Run migrations on production database**
4. **Start the server**:

```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

---

**Happy Coding! 🚀**
