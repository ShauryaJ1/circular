# Database Setup with Prisma & Supabase (Local)

This guide will help you set up the database for the Circular log management system using Prisma ORM with a local Supabase instance.

## Prerequisites

- Node.js 18+ installed
- Docker installed and running
- pnpm package manager

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
pnpm install
```

### 2. Set up Environment Variables

Copy the example environment file:

```bash
cp env.local.example .env.local
```

The file contains default values for local Supabase development.

### 3. Start Supabase Local Development

Initialize and start Supabase locally:

```bash
# Initialize Supabase (first time only)
pnpm supabase init

# Start local Supabase services
pnpm supabase:start
```

This will start:
- PostgreSQL database on `localhost:54322`
- Supabase API on `localhost:54321`
- Supabase Studio on `localhost:54323`

### 4. Generate Prisma Client and Push Schema

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 5. Start the Application

```bash
pnpm dev
```

## Database Schema

The simplified schema includes only the essential components:

### LogEntry
- `id`: Unique identifier
- `level`: Log level (LOG, INFO, WARN, ERROR, DEBUG)
- `message`: Log message
- `timestamp`: When the log was created
- `tags`: Array of tags for categorization
- `solution`: Optional solution linked to this log

### Solution
- `id`: Unique identifier
- `logEntryId`: Links to the parent log entry
- `issueText`: Full text description of the issue
- `solutionText`: Full text description of the solution
- `createdAt`: When the solution was created
- `tags`: Array of tags for categorization

### Tags
- Flexible tagging system for both logs and solutions
- Many-to-many relationships allow multiple tags per item

## Usage Examples

### Creating a Log Entry with Solution

```typescript
import { db } from '@/lib/database'

// Create a log entry with a solution
const logEntry = await db.createLogEntry({
  level: 'ERROR',
  message: 'Payment gateway timeout during checkout',
  tags: ['payment', 'timeout', 'checkout'],
  solution: {
    issueText: 'The payment gateway was taking longer than 30 seconds to respond during the checkout process, causing user frustration and cart abandonment.',
    solutionText: 'Implemented retry logic with exponential backoff and added loading indicators. Also added a fallback payment method when the primary gateway is slow.',
    tags: ['retry-logic', 'ux-improvement', 'fallback']
  }
})
```

### Querying Logs and Solutions

```typescript
// Get all logs with their solutions
const allLogs = await db.getLogEntries()

// Search logs and solutions
const searchResults = await db.searchLogs('payment timeout')

// Get only logs that have solutions
const solvedLogs = await db.getLogsWithSolutions()

// Get logs by level
const errorLogs = await db.getLogsByLevel('ERROR')
```

## Available Scripts

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Create and run migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm supabase:start` - Start local Supabase
- `pnpm supabase:stop` - Stop local Supabase
- `pnpm supabase:status` - Check Supabase status
- `pnpm supabase:reset` - Reset database

## Accessing the Database

### Prisma Studio
Open Prisma Studio to view and edit data:
```bash
pnpm db:studio
```

### Supabase Studio
Access Supabase Studio at: http://localhost:54323

### Direct Database Connection
Connect directly to PostgreSQL:
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres
```

## Production Deployment

For production, update your `.env.local` file with your production Supabase credentials:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

Then run migrations:
```bash
pnpm db:migrate
```

## Troubleshooting

### Port Conflicts
If you have port conflicts, you can modify the ports in `supabase/config.toml`.

### Database Connection Issues
- Ensure Docker is running
- Check that Supabase is started: `pnpm supabase:status`
- Verify environment variables are correct

### Schema Changes
After modifying the Prisma schema:
1. Run `pnpm db:generate` to update the client
2. Run `pnpm db:push` to update the database schema

### Reset Everything
If you need to start fresh:
```bash
pnpm supabase:reset
pnpm db:push
```

## Data Model Overview

```
LogEntry
├── id (string)
├── level (enum)
├── message (string)
├── timestamp (datetime)
├── tags[] (LogTag)
└── solution? (Solution)
    ├── id (string)
    ├── issueText (string)
    ├── solutionText (string)
    ├── createdAt (datetime)
    └── tags[] (SolutionTag)
```

This minimal schema focuses on the core requirements while maintaining flexibility through the tagging system and JSON fields for additional context when needed.
