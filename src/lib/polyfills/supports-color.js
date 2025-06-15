// This is a simplified fallback implementation of the supports-color module
// to prevent build errors if the actual module is missing

const supportsColor = {
  stdout: {
    level: 2,
    hasBasic: true,
    has256: true,
    has16m: false,
  },
  stderr: {
    level: 2,
    hasBasic: true,
    has256: true,
    has16m: false,
  },
};

module.exports = supportsColor;
