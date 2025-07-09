const mockModel = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  save: jest.fn().mockResolvedValue({}),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
};

module.exports = {
  __esModule: true,
  default: mockModel,
};
