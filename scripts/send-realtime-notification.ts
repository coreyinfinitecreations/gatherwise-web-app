import { prisma } from "../src/lib/prisma";

async function sendTestNotification() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "cowens@gatherwise.co" },
    });

    if (!user) {
      console.error("User not found");
      return;
    }

    console.log(`Sending real-time notification to: ${user.email}`);
    console.log("Make sure you have the dashboard open in your browser!");
    console.log("Waiting 3 seconds...\n");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("📬 Sending notification via API...");

    const response = await fetch("http://localhost:3000/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id,
      },
      body: JSON.stringify({
        type: "MEMBER",
        title: "New member joined",
        message: `Jane Smith has been added to your campus`,
        link: `/dashboard/people/test-member-${Date.now()}`,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Notification sent successfully!");
      console.log("ID:", data.notification.id);
      console.log("Title:", data.notification.title);
      console.log("Message:", data.notification.message);
      console.log(
        "\n🔔 Check your browser - it should appear instantly without refreshing!"
      );
    } else {
      console.error("❌ Failed to send notification:", response.statusText);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

sendTestNotification();
