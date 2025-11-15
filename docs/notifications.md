# Real-Time Notification System

## Overview

The Gatherwise platform includes a comprehensive real-time notification system built with WebSockets. This system enables instant delivery of notifications to users for events like new members joining, pathway completions, life group updates, and system announcements.

## Architecture

### Components

1. **WebSocket Server** (`server.ts`)

   - Custom Next.js server with WebSocket support
   - Manages user-specific connections
   - Implements heartbeat/ping-pong for connection health
   - Auto-reconnect with exponential backoff
   - Broadcast functions for targeted and global notifications

2. **Database Layer** (`prisma/schema.prisma`)

   - `Notification` model with indexed fields for performance
   - `NotificationType` enum for categorization
   - Cascade delete when user is removed
   - Tracks read/unread status and timestamps

3. **Client Context** (`src/contexts/notification-context.tsx`)

   - React context for WebSocket connection management
   - Maintains notification state and unread count
   - Auto-reconnect logic with max retry attempts
   - CRUD operations: mark as read, delete, refetch

4. **API Endpoints** (`src/app/api/notifications/`)

   - `GET /api/notifications` - Fetch user's notifications
   - `POST /api/notifications` - Create new notification
   - `DELETE /api/notifications/[id]` - Delete notification
   - `PATCH /api/notifications/[id]/read` - Mark as read
   - `PATCH /api/notifications/read-all` - Mark all as read

5. **Utility Functions** (`src/lib/notifications.ts`)

   - Helper functions for common notification scenarios
   - Type-safe notification creation
   - Bulk notification support
   - WebSocket broadcast integration

6. **UI Components** (`src/components/dashboard/header.tsx`)
   - Bell icon with unread count badge
   - WebSocket connection status indicator
   - Dropdown with notification list
   - Mark as read and delete actions
   - Real-time updates via WebSocket

## Usage

### Creating Notifications

Use the utility functions in `src/lib/notifications.ts`:

```typescript
import {
  notifyNewMember,
  notifyPathwayCompletion,
  notifySystemAnnouncement,
} from "@/lib/notifications";

// Notify about a new member
await notifyNewMember(userId, "John Doe", "member-id-123");

// Notify about pathway completion
await notifyPathwayCompletion(
  userId,
  "Sarah Johnson",
  "Foundations of Faith",
  "member-id-456"
);

// Send announcement to multiple users
await notifySystemAnnouncement(
  [userId1, userId2, userId3],
  "System Maintenance",
  "Scheduled maintenance tonight at 10 PM",
  "/dashboard/settings"
);
```

### Consuming Notifications in Components

Use the `useNotifications` hook:

```typescript
import { useNotifications } from "@/contexts/notification-context";

function MyComponent() {
  const {
    notifications, // Array of notification objects
    unreadCount, // Number of unread notifications
    isConnected, // WebSocket connection status
    markAsRead, // Mark single notification as read
    markAllAsRead, // Mark all as read
    deleteNotification, // Delete a notification
  } = useNotifications();

  return (
    <div>
      <span>Unread: {unreadCount}</span>
      <span>Connected: {isConnected ? "Yes" : "No"}</span>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>Mark Read</button>
        </div>
      ))}
    </div>
  );
}
```

## Notification Types

- `SYSTEM` - System-level notifications (maintenance, updates)
- `EVENT` - Event-related notifications (new event, updates, cancellations)
- `MEMBER` - Member-related notifications (new member, profile updates)
- `LIFE_GROUP` - Life group notifications (attendance, updates)
- `PATHWAY` - Pathway milestone notifications (completions, progress)
- `ANNOUNCEMENT` - General announcements from administrators

## WebSocket Connection

### Client-Side Connection

The WebSocket connection is automatically established when a user logs in via the `NotificationProvider` in the app layout. The connection:

- Authenticates using the user ID
- Maintains a heartbeat to detect disconnections
- Auto-reconnects with exponential backoff (max 5 attempts)
- Updates UI indicators for connection status

### Server-Side Broadcast

The server maintains a map of user IDs to WebSocket connections:

```typescript
// Broadcast to a specific user
broadcastToUser(userId, notification);

// Broadcast to all connected users
broadcastToAll(notification);
```

## Development

### Running the Dev Server

The custom server is used for development to support WebSockets:

```bash
npm run dev
```

This runs `tsx watch server.ts` which starts the Next.js app with WebSocket support.

### Testing Notifications

Run the test script to create sample notifications:

```bash
npx tsx scripts/test-notifications.ts
```

This creates test notifications for the admin user and displays them in the terminal.

### Database Schema

To push schema changes:

```bash
npx prisma db push
```

To regenerate the Prisma client:

```bash
npx prisma generate
```

## Production Considerations

### Environment Variables

Set the WebSocket URL for production:

```env
NEXT_PUBLIC_WS_URL=wss://your-domain.com/api/ws
```

### Scaling

For production deployments with multiple server instances:

1. Consider using a Redis pub/sub system for cross-server notifications
2. Implement sticky sessions or WebSocket-specific load balancing
3. Monitor WebSocket connection counts and server resource usage

### Security

- All notification endpoints require authentication via `x-user-id` header
- Users can only access their own notifications
- WebSocket connections authenticate on initial handshake
- Authorization checks prevent unauthorized access to notifications

## Troubleshooting

### WebSocket Connection Issues

If the connection indicator shows disconnected:

1. Check browser console for WebSocket errors
2. Verify the `NEXT_PUBLIC_WS_URL` environment variable
3. Ensure the server is running and accessible
4. Check network/firewall settings for WebSocket support

### Notifications Not Appearing

1. Verify notifications are being created in the database
2. Check WebSocket connection status in the header
3. Look for errors in server logs
4. Test with the test script to isolate the issue

### TypeScript Errors

If you see "Property 'notification' does not exist" errors:

1. Run `npx prisma generate` to regenerate the client
2. Restart the TypeScript server in VS Code
3. Restart the dev server

## Future Enhancements

- [ ] Email notification fallback for offline users
- [ ] Push notifications for mobile devices
- [ ] Notification preferences and filtering
- [ ] Notification history and archiving
- [ ] Analytics and engagement tracking
- [ ] Custom notification templates
- [ ] Scheduled notifications
- [ ] Notification grouping and threading
