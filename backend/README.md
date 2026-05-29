# Backend - Task Management System

Backend API for the Task Management System project, developed as part of the Fullstack Web Developer Technical Test for PT Kanggo.

This backend handles user authentication, JWT-protected routes, and task CRUD APIs. Each task belongs to one authenticated user through `user_id`, so users can only access their own tasks.

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- dotenv
- cors
- zod

## Features

- Register user
- Login user and return JWT token
- Get authenticated user profile
- Protect task routes using JWT middleware
- Create task
- Get logged-in user's tasks
- Filter tasks by status
- Update task
- Delete task
- User-based task isolation using `user_id`

## Project Structure

```txt
backend/
  src/
    config/
      db.js
    controllers/
      authController.js
      taskController.js
    middleware/
      authMiddleware.js
    models/
      User.js
      Task.js
    routes/
      authRoutes.js
      taskRoutes.js
    validations/
      taskValidation.js
    app.js
    server.js
  .env.example
  package.json
```

## Prerequisites

Before running the backend, make sure you have:

- Node.js installed
- npm installed
- MongoDB Atlas account
- MongoDB connection string

## Database Setup

This project uses MongoDB Atlas.

1. Create a MongoDB Atlas project.
2. Create a cluster.
3. Create a database user.
4. Allow your current IP address in **Network Access**.
5. Copy the MongoDB connection string.
6. Use the database name:

```txt
task-management-db
```

Example MongoDB connection string:

```txt
mongodb+srv://username:password@cluster.mongodb.net/task-management-db
```

The backend uses Mongoose models for:

- `users`
- `tasks`

No manual migration is required.

## Environment Variables

Create a `.env` file inside the `backend` folder.

```bash
cd backend
```

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management-db
JWT_SECRET=replace_with_strong_secret
CLIENT_URL=http://localhost:5173
```

### Environment Variable Explanation

| Variable | Description |
| --- | --- |
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS |

## Install Dependencies

From the root project folder:

```bash
cd backend
npm install
```

## Run Backend

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

By default, the backend will run at:

```txt
http://localhost:5000
```

API base URL:

```txt
http://localhost:5000/api
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run backend using nodemon |
| `npm start` | Run backend using Node.js |
| `npm run db:init` | Run database initialization script, if needed |

## API Endpoints

### Auth Endpoints

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user and return JWT token |

### Task Endpoints

| Method | Endpoint | Auth Required | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | Yes | Get all tasks owned by logged-in user |
| GET | `/api/tasks?status=pending` | Yes | Get pending tasks |
| GET | `/api/tasks?status=in-progress` | Yes | Get in-progress tasks |
| GET | `/api/tasks?status=done` | Yes | Get done tasks |
| POST | `/api/tasks` | Yes | Create new task |
| PUT | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |

Protected endpoints require this header:

```txt
Authorization: Bearer <token>
```

## Request Examples

### Register

```http
POST /api/auth/register
```

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Create Task

```http
POST /api/tasks
```

```json
{
  "title": "Create API documentation",
  "description": "Prepare Postman collection for PT Kanggo test",
  "status": "pending",
  "deadline": "2026-06-01"
}
```

### Update Task

```http
PUT /api/tasks/:id
```

```json
{
  "title": "Updated task title",
  "description": "Updated task description",
  "status": "in-progress",
  "deadline": "2026-06-02"
}
```

## Standard Response Format

All responses use this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "token": null
}
```

Login response includes JWT token:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "test@example.com"
    }
  },
  "message": "Login successful",
  "token": "jwt_token"
}
```

## Database Models

### User

```js
{
  name: String,
  email: String,
  password: String
}
```

### Task

```js
{
  user_id: ObjectId,
  title: String,
  description: String,
  status: 'pending' | 'in-progress' | 'done',
  deadline: Date
}
```

`user_id` is automatically taken from the authenticated JWT user. The client should not send `user_id` when creating or updating tasks.

## API Documentation

Postman Collection is available at:

```txt
docs/postman/task-management-system.postman_collection.json
```

How to use:

1. Open Postman.
2. Import the collection file.
3. Run `Register` to create a user.
4. Run `Login` to receive a JWT token.
5. The JWT token will be stored automatically in the collection variable.
6. Run task requests to test create, read, update, delete, and filter features.

## Notes

- Passwords are hashed using bcrypt before being stored.
- JWT is required for all task routes.
- Task data is scoped by `user_id`.
- Users can only access their own tasks.
- Sensitive files such as `.env` must not be committed to Git.
