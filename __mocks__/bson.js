module.exports = {
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || "mock-object-id" })),
  Binary: jest.fn(),
  Code: jest.fn(),
  DBRef: jest.fn(),
  Decimal128: jest.fn(),
  Double: jest.fn(),
  Int32: jest.fn(),
  Long: jest.fn(),
  MaxKey: jest.fn(),
  MinKey: jest.fn(),
  Timestamp: jest.fn(),
  UUID: jest.fn(),
};
