// Create a single mock instance that will be shared across all imports
const mockUserClass = jest.fn().mockImplementation((data) => {
  const instance = {
    ...data,
    _id: data._id || "mock-user-id",
    id: data._id || "mock-user-id", // Add id property for compatibility
    save: jest.fn().mockResolvedValue(true),
  };
  return instance;
});

// Static methods - make sure these are properly tracked
mockUserClass.findOne = jest.fn();
mockUserClass.findById = jest.fn();
mockUserClass.create = jest.fn();

// Make sure default return value for findOne is null (no user found)
mockUserClass.findOne.mockResolvedValue(null);

// Reset function for tests
mockUserClass.mockReset = () => {
  mockUserClass.mockClear();
  mockUserClass.findOne.mockClear();
  mockUserClass.findById.mockClear();
  mockUserClass.create.mockClear();
  // Reset default behavior
  mockUserClass.findOne.mockResolvedValue(null);
};

// Export the same instance for all imports
module.exports = mockUserClass;
module.exports.default = mockUserClass;
