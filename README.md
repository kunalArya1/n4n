# n4n - AI Workflow Automation Platform

n4n is an AI-powered workflow automation platform that allows users to create, manage, and execute automated workflows for various business processes.

## Project Overview

This project consists of a Next.js frontend and a FastAPI backend that work together to provide a seamless workflow automation experience. The application uses Clerk for authentication and PostgreSQL for data storage.

## Environment Variables

The following environment variables need to be set in your `.env` file:

### Frontend Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for frontend authentication
- `NEXT_PUBLIC_API_URL` - The URL of the backend API (e.g., http://localhost:8000)

### Backend Variables

- `CLERK_SECRET_KEY` - Clerk secret key for backend authentication
- `CLERK_API_URL` - Clerk API URL (defaults to https://api.clerk.dev/v1)
- `DATABASE_URL` - PostgreSQL database connection string
- `AUTHORIZED_ORIGINS` - Comma-separated list of allowed origins for CORS (e.g., http://localhost:3000)

### Example .env File

```env
# Frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
AUTHORIZED_ORIGINS=http://localhost:3000
```

## Project Structure

```
.
├── server/                 # Backend API (FastAPI)
│   ├── main.py            # Main application file
│   ├── auth/               # Authentication related code
│   ├── config/            # Configuration files
│   ├── database/          # Database connection and models
│   └── models/            # Database models
├── src/                   # Frontend (Next.js)
│   ├── app/               # Application pages and components
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utility functions and API clients
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── .env                   # Environment variables
```

## Features

- User authentication with Clerk
- Workspace management (create, view, delete)
- Application creation and management
- Dashboard with workspace overview
- Responsive UI with dark mode support

## Getting Started

1. Clone the repository
2. Set up the environment variables in a `.env` file
3. Install dependencies for both frontend and backend
4. Start the backend server
5. Start the frontend development server

## API Endpoints

- `POST /register` - Register a new user
- `GET /protected` - Validate user authentication
- `POST /applications` - Create a new application/workspace
- `GET /applications` - Retrieve all applications for a user
- `DELETE /applications/{id}` - Delete an application

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Clerk for authentication
- shadcn/ui components

### Backend
- FastAPI for the REST API
- SQLAlchemy for database operations
- PostgreSQL for data storage

## Development

### Frontend Development

```bash
npm run dev
```

### Backend Development

```bash
python server/main.py
```

## Deployment

The application can be deployed to any cloud platform that supports Docker containers or Node.js/Python applications.

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
