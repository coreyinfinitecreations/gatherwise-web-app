import WebSocket from "ws";

console.log("Testing WebSocket connection...\n");

const ws = new WebSocket("ws://localhost:3000/api/ws");

ws.on("open", () => {
  console.log("✅ WebSocket connected successfully!");

  ws.send(
    JSON.stringify({
      type: "auth",
      userId: "test-user-id",
    })
  );

  console.log("📤 Sent authentication message");
});

ws.on("message", (data) => {
  console.log("📨 Received message:", data.toString());
});

ws.on("error", (error) => {
  console.error("❌ WebSocket error:", error.message);
});

ws.on("close", (code, reason) => {
  console.log(
    `🔌 WebSocket closed - Code: ${code}, Reason: ${
      reason || "No reason provided"
    }`
  );
  process.exit(0);
});

setTimeout(() => {
  console.log("⏱️  Closing connection...");
  ws.close();
}, 3000);
