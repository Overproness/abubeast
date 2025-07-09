/**
 * Mock for MongoDB connection - main mock file
 */

const dbConnect = jest.fn().mockResolvedValue(true);

// Default export
export default dbConnect;

// Named export  
export { dbConnect };

// CommonJS compatibility
module.exports = dbConnect;
module.exports.default = dbConnect;
module.exports.dbConnect = dbConnect;
module.exports.__esModule = true;
