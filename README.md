# MERN Task Manager

A full-stack task management application built with MongoDB, Express, React, and Node.js (MERN stack) featuring JWT authentication, role-based access control, and RESTful API.

## Features

- User authentication (Register/Login) with JWT
- Role-based access control (User/Admin)
- CRUD operations for tasks
- Task filtering by status and priority
- Pagination and sorting
- Ownership-based access control
- Swagger API documentation
- Docker containerization

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- Swagger for API documentation

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn
- Docker & Docker Compose (optional)

## Installation

### Option 1: Local Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-task-manager
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Option 2: Docker Setup

1. Make sure Docker and Docker Compose are installed

2. Build and start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Documentation: `http://localhost:5000/api-docs`

4. Stop the services:
```bash
docker-compose down
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mern-task-manager |
| JWT_SECRET | Secret key for JWT signing | (required) |
| NODE_ENV | Environment mode | development |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api/v1 |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

#### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login User
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tasks` | Get all tasks | Yes |
| GET | `/api/v1/tasks/:id` | Get task by ID | Yes |
| POST | `/api/v1/tasks` | Create new task | Yes |
| PUT | `/api/v1/tasks/:id` | Update task | Yes |
| DELETE | `/api/v1/tasks/:id` | Delete task | Yes |

#### Get All Tasks
```bash
GET /api/v1/tasks?status=pending&priority=high&page=1&limit=10&sort=-createdAt
Authorization: Bearer <token>
```

Query Parameters:
- `status`: Filter by status (pending, in-progress, completed)
- `priority`: Filter by priority (low, medium, high)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort field (default: -createdAt)

#### Create Task
```bash
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "status": "pending",
  "priority": "high"
}
```

#### Update Task
```bash
PUT /api/v1/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "in-progress",
  "priority": "medium"
}
```

#### Delete Task
```bash
DELETE /api/v1/tasks/:id
Authorization: Bearer <token>
```

## API Documentation

Interactive API documentation is available via Swagger UI:

- Local: `http://localhost:5000/api-docs`
- Docker: `http://localhost:5000/api-docs`

## Project Structure

```
mern-task-manager/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tasks.js
│   ├── utils/
│   │   └── jwt.js
│   ├── .env
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskList.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── types/
│   │   │   ├── auth.ts
│   │   │   └── task.ts
│   │   ├── utils/
│   │   │   └── axios.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Authentication Flow

1. User registers or logs in
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Token is automatically attached to all API requests via axios interceptor
5. Backend verifies token on protected routes
6. User can access protected resources

## Role-Based Access Control

### User Role
- Can view only their own tasks
- Can create, update, and delete their own tasks
- Cannot access other users' tasks

### Admin Role
- Can view all tasks from all users
- Can create, update, and delete any task
- Full access to all resources

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Testing with Postman

Import the Postman collection from `backend/postman_collection.json`:

1. Open Postman
2. Click Import
3. Select the `postman_collection.json` file
4. Set the `base_url` variable to `http://localhost:5000`
5. After login, set the `jwt_token` variable with the received token

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

## Production Deployment

### Environment Variables
Update the following for production:
- Change `JWT_SECRET` to a strong random string
- Update `MONGODB_URI` with production database
- Set `NODE_ENV=production`

### Build Frontend
```bash
cd frontend
npm run build
```

### Deploy with Docker
```bash
docker-compose up -d
```

## Production Deployment

### Quick Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Backend (Render):**
- Deploy from GitHub
- Add environment variables (see [ENV_VARIABLES.md](ENV_VARIABLES.md))
- Use MongoDB Atlas for database

**Frontend (Vercel/Netlify):**
- Deploy from GitHub
- Set `VITE_API_URL` to your Render backend URL
- Automatic HTTPS and CDN

### Environment Variables

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for complete list of required variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
