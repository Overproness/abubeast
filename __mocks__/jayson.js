module.exports = {
  client: {
    browser: jest.fn(() => ({
      request: jest.fn().mockResolvedValue({ result: {} }),
    })),
    http: jest.fn(() => ({
      request: jest.fn().mockResolvedValue({ result: {} }),
    })),
  },
};
