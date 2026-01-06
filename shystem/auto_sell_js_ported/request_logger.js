// Request Logger Middleware - JavaScript Port
// Port of request_logger.rs

function requestLogger(req, res, next) {
  const start = Date.now();
  const method = req.method;
  const path = req.path;
  const query = req.query
    ? Object.keys(req.query).length > 0
      ? JSON.stringify(req.query)
      : ""
    : "";

  // Log incoming request
  console.log("📥 INCOMING REQUEST");
  console.log(`   Method: ${method}`);
  console.log(`   Path: ${path}`);
  if (query) {
    console.log(`   Query: ${query}`);
  }
  console.log("   Headers:");

  // Log relevant headers
  const relevantHeaders = ["content-type", "user-agent", "content-length"];
  for (const header of relevantHeaders) {
    if (req.headers[header]) {
      console.log(`     ${header}: ${req.headers[header]}`);
    }
  }

  // Get client IP
  const clientIp = req.ip || req.connection?.remoteAddress || "unknown";
  console.log(`   Client IP: ${clientIp}`);

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function (chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);

    const duration = Date.now() - start;
    const status = res.statusCode;

    // Log response
    console.log("📤 RESPONSE");
    console.log(`   Status: ${status}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Path: ${method} ${path}`);

    if (status >= 400 && status < 600) {
      console.warn(`❌ REQUEST FAILED: ${method} ${path} -> ${status}`);
    } else {
      console.log(`✅ REQUEST SUCCESS: ${method} ${path} -> ${status}`);
    }

    console.log(
      "================================================================================"
    );
  };

  next();
}

module.exports = { requestLogger };
