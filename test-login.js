/**
 * Simple test to verify the login endpoint is working
 * This can be run manually to test the server
 */

const testLogin = async () => {
  try {
    console.log("Testing login endpoint...");

    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@demo.com",
        password: "admin123",
      }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok) {
      console.log("✅ Login test passed!");
    } else {
      console.log("❌ Login test failed!");
    }
  } catch (error) {
    console.error("Error testing login:", error);
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testLogin();
}

module.exports = { testLogin };
