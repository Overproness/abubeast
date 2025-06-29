/**
 * Integration Tests for Authentication APIs
 * Tests the actual API endpoints with real HTTP requests
 */

import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { POST as signupHandler } from "@/app/api/auth/signup/route";
import { createMocks } from "node-mocks-http";

// Mock database and models - using manual mocks to avoid module resolution issues
jest.mock("@/lib/db/mongodb", () => jest.fn().mockResolvedValue(true), {
  virtual: true,
});
jest.mock(
  "@/models/User",
  () => ({
    findOne: jest.fn(),
    prototype: {
      save: jest.fn(),
    },
  }),
  { virtual: true }
);

describe("Authentication API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/signup", () => {
    it("should handle successful user registration", async () => {
      const User = require("@/models/User").default;
      const dbConnect = require("@/lib/db/mongodb").default;

      // Mock database operations
      dbConnect.mockResolvedValue(true);
      User.findOne = jest.fn().mockResolvedValue(null);

      const mockUser = {
        _id: "user123",
        email: "newuser@example.com",
        name: "New User",
        save: jest.fn().mockResolvedValue(true),
      };
      User.mockImplementation(() => mockUser);

      const { req } = createMocks({
        method: "POST",
        body: {
          email: "newuser@example.com",
          password: "password123",
          name: "New User",
        },
      });

      // Mock the request.json() method
      req.json = jest.fn().mockResolvedValue({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      });

      const response = await signupHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.success).toBe(true);
      expect(responseBody.user.email).toBe("newuser@example.com");
      expect(responseBody.user.name).toBe("New User");
    });

    it("should reject registration with existing email", async () => {
      const User = require("@/models/User").default;
      const dbConnect = require("@/lib/db/mongodb").default;

      // Mock database operations
      dbConnect.mockResolvedValue(true);
      User.findOne = jest.fn().mockResolvedValue({
        _id: "existing123",
        email: "existing@example.com",
      });

      const { req } = createMocks({
        method: "POST",
        body: {
          email: "existing@example.com",
          password: "password123",
          name: "Test User",
        },
      });

      req.json = jest.fn().mockResolvedValue({
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
      });

      const response = await signupHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(409);
      expect(responseBody.error).toBe("User already exists");
    });

    it("should validate email format", async () => {
      const { req } = createMocks({
        method: "POST",
        body: {
          email: "invalid-email",
          password: "password123",
          name: "Test User",
        },
      });

      req.json = jest.fn().mockResolvedValue({
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      });

      const response = await signupHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe("Invalid email format");
    });

    it("should validate password length", async () => {
      const { req } = createMocks({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "short",
          name: "Test User",
        },
      });

      req.json = jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "short",
        name: "Test User",
      });

      const response = await signupHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody.error).toBe("Password must be at least 8 characters");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should handle successful login", async () => {
      const User = require("@/models/User").default;
      const dbConnect = require("@/lib/db/mongodb").default;
      const bcrypt = require("bcryptjs");

      // Mock database operations
      dbConnect.mockResolvedValue(true);
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        password: "hashedPassword123",
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock password comparison
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const { req } = createMocks({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "password123",
        },
      });

      req.json = jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "password123",
      });

      const response = await loginHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.success).toBe(true);
      expect(responseBody.user.email).toBe("test@example.com");
      expect(response.headers.get("Set-Cookie")).toContain("token=");
    });

    it("should reject login with non-existent user", async () => {
      const User = require("@/models/User").default;
      const dbConnect = require("@/lib/db/mongodb").default;

      dbConnect.mockResolvedValue(true);
      User.findOne = jest.fn().mockResolvedValue(null);

      const { req } = createMocks({
        method: "POST",
        body: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      });

      req.json = jest.fn().mockResolvedValue({
        email: "nonexistent@example.com",
        password: "password123",
      });

      const response = await loginHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody.error).toBe("Invalid credentials");
    });

    it("should reject login with wrong password", async () => {
      const User = require("@/models/User").default;
      const dbConnect = require("@/lib/db/mongodb").default;
      const bcrypt = require("bcryptjs");

      dbConnect.mockResolvedValue(true);
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        password: "hashedPassword123",
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock password comparison to fail
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      const { req } = createMocks({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      });

      req.json = jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "wrongpassword",
      });

      const response = await loginHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody.error).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user info for valid token", async () => {
      // Create a valid token first
      const { generateToken } = require("@/lib/auth/auth");
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      const token = await generateToken(mockUser);

      const { req } = createMocks({
        method: "GET",
        cookies: {
          token: token,
        },
      });

      // Mock the cookies.get method
      req.cookies = {
        get: jest.fn().mockReturnValue({ value: token }),
      };

      const response = await meHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.authenticated).toBe(true);
      expect(responseBody.user.email).toBe("test@example.com");
    });

    it("should reject request without token", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      req.cookies = {
        get: jest.fn().mockReturnValue(null),
      };

      const response = await meHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody.authenticated).toBe(false);
      expect(responseBody.error).toBe("Not authenticated");
    });

    it("should reject request with invalid token", async () => {
      const { req } = createMocks({
        method: "GET",
        cookies: {
          token: "invalid.token.here",
        },
      });

      req.cookies = {
        get: jest.fn().mockReturnValue({ value: "invalid.token.here" }),
      };

      const response = await meHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody.authenticated).toBe(false);
      expect(responseBody.error).toBe("Invalid token");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear authentication cookie", async () => {
      const { req } = createMocks({
        method: "POST",
      });

      const response = await logoutHandler(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody.success).toBe(true);

      const setCookieHeader = response.headers.get("Set-Cookie");
      expect(setCookieHeader).toContain("token=");
      expect(setCookieHeader).toContain("expires=");
    });
  });
});
