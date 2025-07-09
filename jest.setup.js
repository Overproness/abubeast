// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock Web APIs for Next.js environment
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input;
    this.method = init.method || "GET";
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }

  get(name) {
    return this.headers.get(name);
  }
};

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  static json(body, init = {}) {
    return new Response(JSON.stringify(body), {
      status: init.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  }
};

global.Headers = class Headers extends Map {
  get(name) {
    return super.get(name.toLowerCase());
  }

  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }
};

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: "",
      asPath: "",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname: () => "/",
  useSearchParams: () => {
    const params = new URLSearchParams();
    params.get = jest.fn((key) => {
      if (key === "email") return "test@example.com";
      return null;
    });
    return params;
  },
}));

// Mock User model with proper structure
jest.mock("@/models/User", () => {
  const mockUserClass = jest.fn().mockImplementation((data) => ({
    ...data,
    _id: "mock-user-id",
    save: jest.fn().mockResolvedValue(true),
  }));

  mockUserClass.findOne = jest.fn();
  mockUserClass.findById = jest.fn();
  mockUserClass.create = jest.fn();

  return {
    __esModule: true,
    default: mockUserClass,
  };
});

// Mock MongoDB connection - comprehensive mocking
jest.mock("@/lib/db/mongodb", () => {
  const mockDbConnect = jest.fn().mockResolvedValue(true);
  return {
    __esModule: true,
    default: mockDbConnect,
    dbConnect: mockDbConnect,
  };
});

// Mock bcryptjs for password hashing
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue("salt"),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
  verify: jest.fn().mockReturnValue({ userId: "mock-user-id", email: "test@example.com" }),
}));

// Mock bcryptjs with more realistic behavior
jest.mock("bcryptjs", () => {
  const bcrypt = jest.requireActual("bcryptjs");
  return {
    hash: jest.fn().mockImplementation((password, rounds) => {
      // Return a realistic bcrypt hash format
      return Promise.resolve(
        `$2b$${rounds}$abcdefghijklmnopqrstuv${password
          .slice(0, 31)
          .padEnd(31, "x")}`
      );
    }),
    compare: jest.fn().mockImplementation((password, hash) => {
      // Simple mock: if password contains "wrong", return false
      return Promise.resolve(
        !password.includes("wrong") && !password.includes("Wrong")
      );
    }),
  };
});

// Mock jsonwebtoken with more realistic behavior
jest.mock("jsonwebtoken", () => {
  const jwt = jest.requireActual("jsonwebtoken");
  let signedTokens = new Map(); // Track tokens and their secrets

  return {
    sign: jest.fn().mockImplementation((payload, secret, options = {}) => {
      // Create a realistic-looking JWT token
      const header = Buffer.from(
        JSON.stringify({ alg: "HS256", typ: "JWT" })
      ).toString("base64");
      const body = Buffer.from(
        JSON.stringify({
          ...payload,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        })
      ).toString("base64");
      const signature = Buffer.from(`${secret}-signature`).toString("base64");
      const token = `${header}.${body}.${signature}`;

      // Store the token with its secret for verification
      signedTokens.set(token, secret);
      return token;
    }),
    verify: jest.fn().mockImplementation((token, secret, options = {}) => {
      // Simulate verification logic
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token");
      }

      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token format");
      }

      // Check if it's our mock token format
      if (token === "invalid.token.string") {
        throw new Error("Invalid token");
      }

      // Check if the token was signed with the provided secret
      const originalSecret = signedTokens.get(token);
      if (originalSecret && originalSecret !== secret) {
        throw new Error("Invalid secret");
      }

      try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        return payload;
      } catch {
        throw new Error("Invalid token payload");
      }
    }),
  };
});

// Mock the missing tradeExecutor module
jest.mock(
  "@/lib/execution/tradeExecutor.js",
  () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      executeTrade: jest.fn().mockResolvedValue({ success: true }),
      cancelTrade: jest.fn().mockResolvedValue({ success: true }),
    })),
    TradeExecutor: jest.fn().mockImplementation(() => ({
      executeTrade: jest.fn().mockResolvedValue({ success: true }),
      cancelTrade: jest.fn().mockResolvedValue({ success: true }),
    })),
  }),
  { virtual: true }
);

// Mock jose library to avoid ES modules issues
jest.mock("jose", () => ({
  jwtVerify: jest.fn().mockImplementation(async (token, secret) => {
    if (!token || token === "invalid.token.string") {
      throw new Error("Invalid token");
    }
    return {
      payload: {
        userId: "mock-user-id",
        email: "test@example.com",
        name: "Test User",
      },
    };
  }),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mock-jwt-token"),
  })),
}));

// Mock the JWT utility to avoid ES modules issues
jest.mock("@/lib/auth/jwt", () => ({
  generateJWT: jest.fn().mockResolvedValue("mock-jwt-token"),
  verifyToken: jest.fn().mockImplementation((token) => {
    if (!token || token === "invalid-token" || token === "invalid.token.string") {
      throw new Error("Invalid token");
    }
    return {
      userId: "mock-user-id",
      email: "test@example.com",
      name: "Test User",
    };
  }),
}));

// Mock UUID to avoid ES modules issues
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-v4"),
  v1: jest.fn(() => "mock-uuid-v1"),
}));

// Mock Solana Web3.js to avoid ES modules issues
jest.mock("@solana/web3.js", () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn().mockResolvedValue(1000000),
    getAccountInfo: jest.fn().mockResolvedValue(null),
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({ toString: () => key })),
  Transaction: jest.fn().mockImplementation(() => ({})),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({}),
  },
}));

// Mock Jayson RPC client
jest.mock("jayson", () => ({
  client: {
    browser: jest.fn(() => ({
      request: jest.fn().mockResolvedValue({ result: {} }),
    })),
  },
}));

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";

// Mock Mongoose to avoid ES modules issues
jest.mock("mongoose", () => ({
  Schema: jest.fn().mockImplementation(() => ({})),
  model: jest.fn().mockImplementation(() => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
  })),
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    readyState: 1,
  },
}));

// Mock Token model
jest.mock(
  "@/models/Token",
  () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    })),
  }),
  { virtual: true }
);

// Mock TradingPermission model
jest.mock(
  "@/models/TradingPermission",
  () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    })),
  }),
  { virtual: true }
);

// Mock Next.js NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init = {}) => ({
      json: () => Promise.resolve(body),
      status: init.status || 200,
      headers: new Map(Object.entries(init.headers || {})),
    })),
  },
}));
