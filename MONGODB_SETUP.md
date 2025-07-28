# MongoDB Integration Guide

This guide explains how to set up and use MongoDB with SOGETI LAB Interview Assistant.

## Prerequisites

1. **Install MongoDB** (choose one option):
   - **Option A**: Install MongoDB locally from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **Option B**: Use MongoDB Atlas (cloud) from [MongoDB Atlas](https://www.mongodb.com/atlas)
   - **Option C**: Use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

## Environment Setup

The `.env` file already contains the necessary MongoDB configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/interviewai
```

For MongoDB Atlas (cloud), replace the MONGODB_URI with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewai?retryWrites=true&w=majority
```

## Database Schema

The application includes the following MongoDB models:

### User Model
- Stores user authentication and profile information
- Includes credits system for interview sessions
- Password hashing with bcrypt

### Resume Model
- Stores resume data with all sections (education, experience, etc.)
- Supports auto-save functionality
- Links to user accounts
- Tracks default resume per user

### Interview Session Model
- Records interview sessions and questions/answers
- Tracks session duration and credits used
- Supports both trial and premium sessions

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /me` - Get current user
- `PUT /updatedetails` - Update user profile

### Resume Routes (`/api/resumes`)
- `GET /` - Get all user resumes
- `POST /` - Create new resume
- `GET /:id` - Get specific resume
- `PUT /:id` - Update resume (used for auto-save)
- `DELETE /:id` - Delete resume
- `PUT /:id/default` - Set as default resume

## Running the Application

1. **Start MongoDB** (if using local installation)
   ```bash
   # On Windows (if MongoDB service isn't running)
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start both frontend and backend**
   ```bash
   npm run dev:full
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server:dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Features Implemented

### Auto-Save System
- Saves resume data automatically after 2 seconds of inactivity
- Shows real-time save status (Saving... → Saved)
- Triggers save when navigating away

### User Authentication
- JWT-based authentication with secure cookies
- Password hashing with bcrypt
- Protected routes for authenticated users

### Resume Management
- Full CRUD operations for resumes
- Support for parsed PDF data
- Default resume system per user

## Database Collections

After running the application, you'll see these collections in MongoDB:

1. **users** - User accounts and authentication
2. **resumes** - User resume data
3. **interviewsessions** - Interview session records (future feature)

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running on port 27017
- Check firewall settings
- Verify the MONGODB_URI in .env file

### Authentication Issues
- Clear localStorage and cookies
- Check JWT_SECRET is set in .env
- Verify user exists in database

### Auto-Save Issues
- Check network connectivity
- Monitor browser console for errors
- Verify user is authenticated

## Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- Protected API routes
- CORS configuration
- Input validation and sanitization

## Development Commands

```bash
# Start development with both frontend and backend
npm run dev:full

# Start only backend
npm run server:dev

# Start only frontend
npm run dev

# Build backend
npm run server:build

# Check backend health
curl http://localhost:5000/api/health
```

## Production Deployment

1. Set NODE_ENV=production in .env
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Use environment variables for sensitive data
5. Set up proper logging and monitoring

## Next Steps

- Connect to a production MongoDB instance
- Add data validation and error handling
- Implement interview session storage
- Add file upload for resume PDFs
- Create admin dashboard for user management
