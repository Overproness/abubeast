/**
 * Comprehensive Authentication Tests
 * Tests for user registration and login functionality
 */

import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as signupHandler } from "@/app/api/auth/signup/route";
import {
  comparePassword,
  createUser,
  generateToken,
  getUserByEmail,
  verifyToken,
} from "@/lib/auth/auth";

// Mock next/server
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options?.status || 200,
      headers: new Map(Object.entries(options?.headers || {})),
    })),
  },
}));

// Mock database connection - using manual mocks to avoid module resolution issues
jest.mock("@/lib/db/mongodb", () => jest.fn().mockResolvedValue(true), {
  virtual: true,
});

// Mock User model
jest.mock(
  "@/models/User",
  () => ({
    findOne: jest.fn(),
    mockImplementation: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  }),
  { virtual: true }
);

// Mock CORS middleware
jest.mock("@/lib/middlewares/cors", () => ({
  cors: jest.fn().mockResolvedValue(null),
}));

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
  compare: jest.fn(),
}));

// Mock cookie serialization
jest.mock("cookie", () => ({
  serialize: jest.fn().mockReturnValue("token=mock-token; HttpOnly; Path=/"),
}));

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.NODE_ENV = "test";

describe("Authentication: Registration and Login", () => {
  const User = require("@/models/User").default;
  const bcrypt = require("bcryptjs");
  const { NextResponse } = require("next/server");

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NextResponse mock
    NextResponse.json.mockImplementation((data, options) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options?.status || 200,
      headers: new Map(Object.entries(options?.headers || {})),
    }));
  });

  describe("User Registration", () => {
    describe("createUser function", () => {
      it("should create a new user successfully", async () => {
        const mockUser = {
          _id: "user123",
          email: "test@example.com",
          name: "Test User",
          save: jest.fn().mockResolvedValue(true),
        };

        User.findOne = jest.fn().mockResolvedValue(null); // User doesn't exist
        User.mockImplementation = jest.fn().mockReturnValue(mockUser);

        const userData = {
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        };

        const result = await createUser(userData);

        expect(result).toEqual({
          id: "user123",
          email: "test@example.com",
          name: "Test User",
        });
        expect(User.findOne).toHaveBeenCalledWith({
          email: "test@example.com",
        });
      });

      it("should reject duplicate email registration", async () => {
        const existingUser = {
          _id: "existing123",
          email: "test@example.com",
          name: "Existing User",
        };

        User.findOne = jest.fn().mockResolvedValue(existingUser);

        const userData = {
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        };

        await expect(createUser(userData)).rejects.toThrow(
          "User already exists"
        );
      });
    });

    describe("POST /api/auth/signup", () => {
      it("should handle successful registration", async () => {
        const mockUser = {
          _id: "user123",
          email: "newuser@example.com",
          name: "New User",
          save: jest.fn().mockResolvedValue(true),
        };

        User.findOne = jest.fn().mockResolvedValue(null);
        User.mockImplementation = jest.fn().mockReturnValue(mockUser);

        const request = {
          json: jest.fn().mockResolvedValue({
            email: "newuser@example.com",
            password: "password123",
            name: "New User",
          }),
        };

        const response = await signupHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.success).toBe(true);
        expect(responseBody.user.email).toBe("newuser@example.com");
        expect(responseBody.user.name).toBe("New User");
      });

      it("should validate required fields", async () => {
        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            // Missing password and name
          }),
        };

        const response = await signupHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe("Missing required fields");
      });

      it("should validate email format", async () => {
        const request = {
          json: jest.fn().mockResolvedValue({
            email: "invalid-email",
            password: "password123",
            name: "Test User",
          }),
        };

        const response = await signupHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe("Invalid email format");
      });

      it("should validate password length", async () => {
        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            password: "short",
            name: "Test User",
          }),
        };

        const response = await signupHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe(
          "Password must be at least 8 characters"
        );
      });

      it("should handle duplicate email registration", async () => {
        const existingUser = {
          _id: "existing123",
          email: "test@example.com",
          name: "Existing User",
        };

        User.findOne = jest.fn().mockResolvedValue(existingUser);

        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            password: "password123",
            name: "Test User",
          }),
        };

        const response = await signupHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(500);
        expect(responseBody.error).toBeDefined();
      });
    });
  });

  describe("User Login", () => {
    describe("Authentication functions", () => {
      it("should verify password correctly", async () => {
        bcrypt.compare.mockResolvedValue(true);

        const result = await comparePassword(
          "password123",
          "hashedPassword123"
        );

        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith(
          "password123",
          "hashedPassword123"
        );
      });

      it("should reject incorrect password", async () => {
        bcrypt.compare.mockResolvedValue(false);

        const result = await comparePassword(
          "wrongpassword",
          "hashedPassword123"
        );

        expect(result).toBe(false);
      });

      it("should get user by email", async () => {
        const mockUser = {
          _id: "user123",
          email: "test@example.com",
          name: "Test User",
          password: "hashedPassword123",
        };

        User.findOne = jest.fn().mockResolvedValue(mockUser);

        const result = await getUserByEmail("test@example.com");

        expect(result).toEqual(mockUser);
        expect(User.findOne).toHaveBeenCalledWith({
          email: "test@example.com",
        });
      });
    });

    describe("POST /api/auth/login", () => {
      it("should login with valid credentials", async () => {
        const mockUser = {
          _id: "user123",
          email: "test@example.com",
          name: "Test User",
          password: "hashedPassword123",
        };

        User.findOne = jest.fn().mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            password: "password123",
          }),
        };

        const response = await loginHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(200);
        expect(responseBody.success).toBe(true);
        expect(responseBody.user.email).toBe("test@example.com");
        expect(responseBody.user.name).toBe("Test User");
        expect(response.headers.get("Set-Cookie")).toContain("token=");
      });

      it("should reject login with invalid email", async () => {
        User.findOne = jest.fn().mockResolvedValue(null);

        const request = {
          json: jest.fn().mockResolvedValue({
            email: "nonexistent@example.com",
            password: "password123",
          }),
        };

        const response = await loginHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(401);
        expect(responseBody.error).toBe("Invalid credentials");
      });

      it("should reject login with invalid password", async () => {
        const mockUser = {
          _id: "user123",
          email: "test@example.com",
          name: "Test User",
          password: "hashedPassword123",
        };

        User.findOne = jest.fn().mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            password: "wrongpassword",
          }),
        };

        const response = await loginHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(401);
        expect(responseBody.error).toBe("Invalid credentials");
      });

      it("should validate required fields", async () => {
        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            // Missing password
          }),
        };

        const response = await loginHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody.error).toBe("Email and password are required");
      });

      it("should handle server errors gracefully", async () => {
        User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

        const request = {
          json: jest.fn().mockResolvedValue({
            email: "test@example.com",
            password: "password123",
          }),
        };

        const response = await loginHandler(request);
        const responseBody = await response.json();

        expect(response.status).toBe(500);
        expect(responseBody.error).toBe("Authentication failed");
      });
    });
  });

  describe("JWT Token Operations", () => {
    it("should generate valid JWT token", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      const token = await generateToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should verify valid JWT token", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      const token = await generateToken(mockUser);
      const decoded = await verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe("user123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.name).toBe("Test User");
    });

    it("should reject invalid JWT token", async () => {
      const invalidToken = "invalid.token.here";
      const decoded = await verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it("should handle token generation errors", async () => {
      // Mock JWT library to throw an error
      jest.doMock("jsonwebtoken", () => ({
        sign: jest.fn().mockImplementation(() => {
          throw new Error("JWT signing error");
        }),
      }));

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      await expect(generateToken(mockUser)).rejects.toThrow(
        "JWT signing error"
      );
    });
  });

  describe("Integration Tests", () => {
    it("should complete full registration and login flow", async () => {
      // Step 1: Register a new user
      const mockUser = {
        _id: "user123",
        email: "fullflow@example.com",
        name: "Full Flow User",
        password: "hashedPassword123",
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne = jest.fn().mockResolvedValue(null); // User doesn't exist for registration
      User.mockImplementation = jest.fn().mockReturnValue(mockUser);

      const signupRequest = {
        json: jest.fn().mockResolvedValue({
          email: "fullflow@example.com",
          password: "password123",
          name: "Full Flow User",
        }),
      };

      const signupResponse = await signupHandler(signupRequest);
      const signupBody = await signupResponse.json();

      expect(signupResponse.status).toBe(200);
      expect(signupBody.success).toBe(true);

      // Step 2: Login with the registered user
      User.findOne = jest.fn().mockResolvedValue(mockUser); // User exists for login
      bcrypt.compare.mockResolvedValue(true);

      const loginRequest = {
        json: jest.fn().mockResolvedValue({
          email: "fullflow@example.com",
          password: "password123",
        }),
      };

      const loginResponse = await loginHandler(loginRequest);
      const loginBody = await loginResponse.json();

      expect(loginResponse.status).toBe(200);
      expect(loginBody.success).toBe(true);
      expect(loginBody.user.email).toBe("fullflow@example.com");
      expect(loginResponse.headers.get("Set-Cookie")).toContain("token=");
    });

    it("should handle edge cases in the flow", async () => {
      // Test empty request body
      const emptyRequest = {
        json: jest.fn().mockResolvedValue({}),
      };

      const emptyResponse = await signupHandler(emptyRequest);
      const emptyBody = await emptyResponse.json();

      expect(emptyResponse.status).toBe(400);
      expect(emptyBody.error).toBe("Missing required fields");
    });
  });
});
