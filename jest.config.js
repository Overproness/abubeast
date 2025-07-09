const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/pages/_app.js",
    "!src/pages/_document.js",
  ],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Add module name mapping for better imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^~/(.*)$": "<rootDir>/$1",
    // Mock problematic ES modules
    "^uuid$": "<rootDir>/__mocks__/uuid.js",
    "^bson$": "<rootDir>/__mocks__/bson.js",
    "^mongodb$": "<rootDir>/__mocks__/mongodb.js",
    "^mongoose$": "<rootDir>/__mocks__/mongoose.js",
    "^@solana/web3.js$": "<rootDir>/__mocks__/solana.js",
    "^jayson$": "<rootDir>/__mocks__/jayson.js",
    // Mock model files (both alias and relative paths)
    "^@/models/(.*)$": "<rootDir>/__mocks__/models/$1",
    "^.*models/(.*)$": "<rootDir>/__mocks__/models/$1",
    // Mock DB connection
    "^@/lib/db/mongodb$": "<rootDir>/__mocks__/mongodb.connection.js",
    "^.*db/mongodb.js$": "<rootDir>/__mocks__/mongodb.connection.js",
  },
  // Handle ES modules
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    "node_modules/(?!(jose|@next/.*|next/.*|uuid|@solana/.*|jayson|bson|mongodb|mongoose)/)"
  ],
  // Allow virtual mocks
  resolver: undefined,
  // Handle ES modules
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
