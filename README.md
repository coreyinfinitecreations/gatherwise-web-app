# Gatherwise Church Management System

A comprehensive web application for managing church communities, members, and discipleship pathways.

## Features

- **Member Management**: Track church members with detailed profiles and engagement metrics
- **Discipleship Pathways**: Create and manage custom spiritual growth journeys
- **Progress Tracking**: Monitor individual progress through pathways and milestones
- **Analytics & Insights**: Gain insights into community health and growth
- **Multi-Church Support**: Manage multiple church communities from one platform

## Technology Stack

- **Frontend**: Next.js 14+ with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Custom Gatherwise color palette

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your database and authentication settings.

4. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application includes models for:

- **Users & Authentication**: NextAuth.js integration
- **Churches**: Multi-tenant church management
- **Members**: Church membership tracking
- **Pathways**: Custom discipleship journeys
- **Progress Tracking**: Individual member progress

## Color Palette

```css
primary: #FE7743 (Orange)
secondary: #0C7489 (Dark Teal)
tertiary: #13505B (Darker Teal)
dark: #273F4F (Dark Blue-Gray)
light: #D7D9CE (Light Gray)
white: #FFFFFF (Pure White)
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open database browser

## License

© 2024 Gatherwise. Building stronger church communities.
