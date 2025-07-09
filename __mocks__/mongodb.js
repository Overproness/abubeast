module.exports = {
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: "mock-id" }),
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      }),
    }),
    close: jest.fn().mockResolvedValue(true),
  })),
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || "mock-object-id" })),
};
