import { prisma } from "../src/lib/prisma";

async function sendMultipleNotifications() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "cowens@gatherwise.co" },
    });

    if (!user) {
      console.error("User not found");
      return;
    }

    console.log(`Sending 3 notifications to: ${user.email}`);
    console.log("Make sure you have the dashboard open in your browser!");
    console.log("Waiting 3 seconds...\n");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("📬 Sending notifications...\n");

    const notifications = [
      {
        type: "MEMBER",
        title: "New member joined",
        message: "Sarah Johnson completed the visitor pathway",
        link: `/dashboard/people/member-${Date.now()}-1`,
      },
      {
        type: "PATHWAY",
        title: "Pathway milestone reached",
        message: "5 members completed 'Foundations of Faith'",
        link: `/dashboard/pathways`,
      },
      {
        type: "LIFE_GROUP",
        title: "Life group update",
        message: "Young Adults group attendance recorded",
        link: `/dashboard/life-groups/group-${Date.now()}`,
      },
    ];

    for (let i = 0; i < notifications.length; i++) {
      const notif = notifications[i];

      const response = await fetch("http://localhost:3000/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(notif),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Notification ${i + 1} sent successfully!`);
        console.log(`   Title: ${data.notification.title}`);
      } else {
        console.error(
          `❌ Failed to send notification ${i + 1}:`,
          response.statusText
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log("\n🔔 Check your browser - all 3 should appear instantly!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

sendMultipleNotifications();
