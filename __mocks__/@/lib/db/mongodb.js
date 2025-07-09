/**
 * Mock for MongoDB database connection (@ alias)
 */

const dbConnect = jest.fn().mockResolvedValue(true);

// Create a default export
export default dbConnect;

// Also create a named export for compatibility
export { dbConnect };

// For CommonJS compatibility
module.exports = dbConnect;
module.exports.default = dbConnect;
module.exports.dbConnect = dbConnect;
