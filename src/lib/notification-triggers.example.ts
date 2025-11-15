import { notifyNewMember, notifyLifeGroupUpdate } from "@/lib/notifications";

export async function onMemberCreated(member: any, campusAdminIds: string[]) {
  for (const adminId of campusAdminIds) {
    await notifyNewMember(adminId, member.name, member.id);
  }
}

export async function onLifeGroupAttendanceUpdated(
  group: any,
  leaderIds: string[]
) {
  for (const leaderId of leaderIds) {
    await notifyLifeGroupUpdate(
      leaderId,
      group.name,
      group.id,
      "Attendance has been recorded"
    );
  }
}
