// This is a simplified JWT verification module that works in Edge runtime
// It only validates that the token structure is correct and hasn't expired

export function verifyJwtForEdge(token) {
  if (!token) return null;

  try {
    // Basic structure validation
    const segments = token.split(".");
    if (segments.length !== 3) {
      return null;
    }

    // Parse the payload
    const payloadBase64 = segments[1];

    // Base64 URL decode
    const decodedPayload = Buffer.from(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString();

    let payload;
    try {
      payload = JSON.parse(decodedPayload);
    } catch (e) {
      return null;
    }

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.log("Token expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[EdgeJwt] Error:", error);
    return null;
  }
}
