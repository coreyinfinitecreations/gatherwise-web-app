import { WebSocket } from "ws";

declare global {
  var wsClients: Map<string, Set<any>> | undefined;
}

export function setClientsMap(map: Map<string, Set<any>>) {
  global.wsClients = map;
}

export function getClientsMap(): Map<string, Set<any>> | undefined {
  return global.wsClients;
}

export function broadcastToUser(userId: string, notification: any) {
  const clientsMap = getClientsMap();

  if (!clientsMap) {
    console.warn(
      "Clients map not initialized - WebSocket server may not be running"
    );
    return;
  }

  const userClients = clientsMap.get(userId);
  if (!userClients || userClients.size === 0) {
    console.log(`No connected clients for user ${userId}`);
    return;
  }

  const message = JSON.stringify({
    type: "notification",
    data: notification,
  });

  let sentCount = 0;
  userClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });

  console.log(
    `Broadcasted notification to ${sentCount} client(s) for user ${userId}`
  );
}

export function broadcastToAll(notification: any) {
  const clientsMap = getClientsMap();

  if (!clientsMap) {
    console.warn(
      "Clients map not initialized - WebSocket server may not be running"
    );
    return;
  }

  const message = JSON.stringify({
    type: "notification",
    data: notification,
  });

  let sentCount = 0;
  clientsMap.forEach((clients) => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        sentCount++;
      }
    });
  });

  console.log(`Broadcasted notification to ${sentCount} total client(s)`);
}
