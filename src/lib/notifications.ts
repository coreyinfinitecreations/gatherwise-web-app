import { prisma } from "./prisma";
import { broadcastToUser } from "./websocket-broadcast";

export type NotificationType =
  | "SYSTEM"
  | "EVENT"
  | "MEMBER"
  | "LIFE_GROUP"
  | "PATHWAY"
  | "ANNOUNCEMENT";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });

  broadcastToUser(userId, notification);

  return notification;
}

export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, "userId">
) {
  const createdNotifications = [];

  for (const userId of userIds) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
    });

    broadcastToUser(userId, notification);
    createdNotifications.push(notification);
  }

  return createdNotifications;
}

export async function notifyNewMember(
  userId: string,
  memberName: string,
  memberId: string
) {
  return createNotification({
    userId,
    type: "MEMBER",
    title: "New member joined",
    message: `${memberName} has been added to your campus`,
    link: `/dashboard/people/${memberId}`,
  });
}

export async function notifyEventUpdate(
  userIds: string[],
  eventName: string,
  eventId: string
) {
  return createBulkNotifications(userIds, {
    type: "EVENT",
    title: "Event updated",
    message: `${eventName} has been updated`,
    link: `/dashboard/events/${eventId}`,
  });
}

export async function notifyPathwayCompletion(
  userId: string,
  memberName: string,
  pathwayName: string,
  memberId: string
) {
  return createNotification({
    userId,
    type: "PATHWAY",
    title: "Pathway milestone reached",
    message: `${memberName} completed "${pathwayName}"`,
    link: `/dashboard/people/${memberId}`,
  });
}

export async function notifyLifeGroupUpdate(
  userId: string,
  groupName: string,
  groupId: string,
  updateType: string
) {
  return createNotification({
    userId,
    type: "LIFE_GROUP",
    title: "Life group update",
    message: `${groupName}: ${updateType}`,
    link: `/dashboard/life-groups/${groupId}`,
  });
}

export async function notifySystemAnnouncement(
  userIds: string[],
  title: string,
  message: string,
  link?: string
) {
  return createBulkNotifications(userIds, {
    type: "ANNOUNCEMENT",
    title,
    message,
    link,
  });
}

export async function notifySystemUpdate(userId: string, message: string) {
  return createNotification({
    userId,
    type: "SYSTEM",
    title: "System notification",
    message,
  });
}
