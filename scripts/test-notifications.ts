import {
  notifyNewMember,
  notifySystemAnnouncement,
} from "../src/lib/notifications";
import { prisma } from "../src/lib/prisma";

async function testNotifications() {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { email: "cowens@gatherwise.co" },
    });

    if (!adminUser) {
      console.error("Admin user not found");
      return;
    }

    console.log(`Testing notifications for user: ${adminUser.email}`);

    console.log("\n1. Creating new member notification...");
    const memberNotification = await notifyNewMember(
      adminUser.id,
      "John Doe",
      "test-member-id"
    );
    console.log("✅ Member notification created:", memberNotification.id);

    console.log("\n2. Creating system announcement...");
    const announcement = await notifySystemAnnouncement(
      [adminUser.id],
      "Welcome to Gatherwise",
      "Your real-time notification system is now active!",
      "/dashboard"
    );
    console.log("✅ System announcement created");

    console.log("\n3. Fetching all notifications for user...");
    const allNotifications = await prisma.notification.findMany({
      where: { userId: adminUser.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log(`\n📬 Found ${allNotifications.length} notifications:`);
    allNotifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Message: ${notif.message}`);
      console.log(`   Read: ${notif.read ? "Yes" : "No"}`);
      console.log(`   Created: ${notif.createdAt.toLocaleString()}`);
    });

    console.log("\n✅ Test completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Open http://localhost:3000/dashboard in your browser");
    console.log("2. Look at the bell icon in the header");
    console.log("3. You should see the notification count badge");
    console.log("4. Click the bell to view notifications");
    console.log("5. WebSocket connection status shows with wifi icon");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications();
