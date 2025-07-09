const ObjectIdType = jest.fn().mockImplementation((id) => ({ toString: () => id || "mock-object-id" }));

const Schema = jest.fn().mockImplementation(() => ({}));
Schema.Types = {
  ObjectId: ObjectIdType,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Array: Array,
  Mixed: jest.fn(),
};

const mongoose = {
  Schema,
  model: jest.fn().mockImplementation(() => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({}),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  })),
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
  Types: {
    ObjectId: ObjectIdType,
  },
};

module.exports = {
  __esModule: true,
  default: mongoose,
  Schema,
  model: mongoose.model,
  connect: mongoose.connect,
  connection: mongoose.connection,
  Types: mongoose.Types,
};
