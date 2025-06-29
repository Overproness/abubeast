# Authentication System Documentation

## Overview

This document describes the authentication system for the AbuBeast application, including the API endpoints, testing procedures, and implementation details.

## Fixed Issues

### ✅ generateToken Function Issue

**Problem**: The `generateToken` function was being imported in `src/app/api/auth/login/route.js` but didn't exist in the auth module.

**Solution**: Added the missing `generateToken` function to `src/lib/auth/auth.js`:

```javascript
// Generate a JWT token for a user (alias for signToken for compatibility)
export async function generateToken(user) {
  try {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return await signToken(payload);
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
  }
}
```

## API Endpoints

### 1. User Registration (`POST /api/auth/signup`)

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses**:

- `400` - Missing required fields
- `400` - Invalid email format
- `400` - Password must be at least 8 characters
- `409` - User already exists
- `500` - Failed to create user

### 2. User Login (`POST /api/auth/login`)

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

Sets HTTP-only cookie: `token=JWT_TOKEN`

**Error Responses**:

- `400` - Email and password are required
- `401` - Invalid credentials
- `500` - Authentication failed

### 3. Get Current User (`GET /api/auth/me`)

**Success Response** (200):

```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "user_id",
    "userId": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Error Responses**:

- `401` - Not authenticated
- `401` - Invalid token
- `500` - Authentication check failed

### 4. User Logout (`POST /api/auth/logout`)

**Success Response** (200):

```json
{
  "success": true
}
```

Clears the authentication cookie by setting it to expire in the past.

## Security Features

### Password Security

- Passwords are hashed using bcryptjs with salt rounds of 12
- Minimum password length: 8 characters
- Plain text passwords are never stored

### JWT Token Security

- Tokens expire after 7 days
- Signed with a secret key stored in environment variables
- Contains user ID, email, and name in the payload

### Cookie Security

- HTTP-only cookies (not accessible via JavaScript)
- Secure flag enabled in production
- SameSite policy configured
- Proper path and expiration settings

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test files
npm test auth-basic.test.js
npm test api-format.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Files

1. **`__tests__/auth-basic.test.js`** - Basic validation and utility tests
2. **`__tests__/api-format.test.js`** - API response format validation tests
3. **`__tests__/auth.test.js`** - Comprehensive authentication tests (requires Next.js mocking)
4. **`__tests__/auth-integration.test.js`** - Integration tests for API endpoints
5. **`__tests__/auth-helpers.test.js`** - Unit tests for helper functions

### Test Categories

#### ✅ Working Tests

- Password validation (length requirements)
- Email format validation
- JWT token structure validation
- HTTP status code validation
- API response format testing
- Cookie configuration testing
- Authentication flow logic testing

#### ⚠️ Advanced Tests (Require Module Mocking)

- Database operation tests
- API endpoint integration tests
- bcryptjs hashing tests
- JWT signing/verification tests

## Manual Testing

### Test User Registration

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Test Authentication Check

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Test Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Environment Variables

Make sure these environment variables are set:

```env
JWT_SECRET=your-secure-jwt-secret-key
MONGODB_URI=mongodb://localhost:27017/your-database
NODE_ENV=development
```

## File Structure

```
src/
├── app/api/auth/
│   ├── login/route.js      # Login endpoint
│   ├── logout/route.js     # Logout endpoint
│   ├── me/route.js         # Current user endpoint
│   └── signup/route.js     # Registration endpoint
├── lib/auth/
│   ├── auth.js            # Authentication utilities
│   └── jwt.js             # JWT utilities
├── models/
│   └── User.js            # User database model
└── middleware.js          # Authentication middleware

__tests__/
├── auth-basic.test.js      # Basic validation tests
├── api-format.test.js      # API format tests
├── auth.test.js           # Comprehensive tests
├── auth-integration.test.js # Integration tests
└── auth-helpers.test.js    # Helper function tests
```

## Development Workflow

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Run tests in watch mode** (in another terminal):

   ```bash
   npm run test:watch
   ```

3. **Make changes** to authentication code

4. **Test manually** using curl commands or Postman

5. **Run full test suite** before committing:
   ```bash
   npm test
   ```

## Common Issues and Solutions

### Issue: "generateToken is not a function"

**Solution**: ✅ Fixed by adding the `generateToken` function to `auth.js`

### Issue: Jest module resolution errors

**Solution**: Use simplified tests that don't require complex Next.js module mocking

### Issue: Database connection in tests

**Solution**: Mock database operations or use test database

### Issue: Environment variables in tests

**Solution**: Set test environment variables in `jest.setup.js`

## Next Steps

1. **Enhanced Testing**: Set up proper database mocking for integration tests
2. **Rate Limiting**: Add rate limiting to authentication endpoints
3. **Password Reset**: Implement password reset functionality
4. **Email Verification**: Add email verification for new accounts
5. **2FA**: Implement two-factor authentication
6. **Session Management**: Add session invalidation and refresh tokens

## Contribution Guidelines

1. All authentication changes must include tests
2. Follow the existing code style and patterns
3. Update this documentation when adding new features
4. Ensure all tests pass before submitting PRs
5. Test manually with curl or Postman
