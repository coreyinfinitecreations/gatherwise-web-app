async function testLoginAPI() {
  const email = "admin@gatherwise.com";
  const password = "Password123!";

  console.log("Testing login API...");
  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("\nResponse status:", response.status);
    console.log("Response statusText:", response.statusText);

    const data = await response.json();
    console.log("\nResponse data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Login successful!");
    } else {
      console.log("\n❌ Login failed!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testLoginAPI();
