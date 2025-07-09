/**
 * Mock for User model (@ alias)
 */

const mockUser = {
  _id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    _id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User'
  })
};

// Mock constructor function
const User = jest.fn().mockImplementation((userData) => ({
  ...mockUser,
  ...userData,
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    _id: userData?._id || 'mock-user-id',
    email: userData?.email || 'test@example.com',
    name: userData?.name || 'Test User'
  })
}));

// Static methods
User.findOne = jest.fn();
User.findById = jest.fn();
User.find = jest.fn();
User.create = jest.fn();
User.findByIdAndUpdate = jest.fn();
User.findByIdAndDelete = jest.fn();

// Default export
export default User;

// Named export for compatibility
export { User };

// CommonJS compatibility
module.exports = User;
module.exports.default = User;
module.exports.User = User;
