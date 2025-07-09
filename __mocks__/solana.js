module.exports = {
  Connection: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn().mockResolvedValue(1000000),
    getAccountInfo: jest.fn().mockResolvedValue(null),
    getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: "mock-blockhash" }),
    sendTransaction: jest.fn().mockResolvedValue("mock-signature"),
  })),
  PublicKey: jest.fn().mockImplementation((key) => ({ 
    toString: () => key,
    toBase58: () => key,
  })),
  Transaction: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    sign: jest.fn(),
  })),
  SystemProgram: {
    transfer: jest.fn().mockReturnValue({}),
  },
  LAMPORTS_PER_SOL: 1000000000,
};
