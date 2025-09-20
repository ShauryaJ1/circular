# Circular Frontend

A modern web interface for the Circular agentic browser testing platform, inspired by Trigger.dev's design and functionality.

## Features

### 🎯 Core Functionality
- **Task Management**: Create, monitor, and manage browser testing tasks
- **Run Tracking**: Real-time monitoring of task executions with detailed logs
- **Solutions Database**: Knowledge base for storing and retrieving solutions to common issues
- **DevTools Integration**: Browser-like monitoring for console, network, and storage

### 📊 Dashboard & Analytics
- **Overview Dashboard**: Real-time stats and recent activity
- **Task Performance**: Success rates, execution times, and trends
- **Run History**: Complete execution history with filtering and search
- **Analytics**: Performance metrics and insights

### 🔍 Monitoring Tools
- **Console Monitor**: Real-time browser console output with filtering
- **Network Monitor**: HTTP request/response tracking with detailed inspection
- **Storage Monitor**: localStorage, sessionStorage, and cookies management
- **Log Viewer**: Comprehensive logging with multiple sources and levels

### 💡 Solutions Management
- **Issue Tracking**: Document problems and their solutions
- **Effectiveness Rating**: Track solution success rates
- **Tag System**: Organize solutions by categories
- **Usage Analytics**: Monitor which solutions are most helpful

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Heroicons
- **State Management**: React hooks (easily extensible with Zustand/Redux)

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development server**:
   ```bash
   pnpm dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Dashboard
│   │   ├── tasks/          # Task management
│   │   ├── runs/           # Run monitoring
│   │   ├── logs/           # Log viewer
│   │   ├── solutions/      # Solutions database
│   │   ├── analytics/      # Analytics & reporting
│   │   └── settings/       # Configuration
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── layout/        # Layout components
│   │   ├── dashboard/     # Dashboard-specific
│   │   ├── tasks/         # Task management
│   │   ├── runs/          # Run monitoring
│   │   ├── logs/          # Log viewing
│   │   ├── solutions/     # Solutions management
│   │   └── monitoring/    # DevTools-like monitoring
│   ├── lib/               # Utilities and helpers
│   │   ├── utils.ts       # Common utilities
│   │   └── mock-data.ts   # Development data
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── package.json
```

## Key Components

### Layout System
- **MainLayout**: Primary application layout with sidebar and header
- **Sidebar**: Navigation with active states and user feedback
- **Header**: Search, notifications, and user controls

### Monitoring Components
- **NetworkMonitor**: DevTools-style network request inspection
- **ConsoleMonitor**: Real-time console output with filtering
- **StorageMonitor**: Browser storage management interface
- **LogViewer**: Multi-source log aggregation and filtering

### Data Management
- **Mock Data**: Comprehensive sample data for development
- **Type System**: Full TypeScript coverage for all data structures
- **Utilities**: Date formatting, status colors, and helper functions

## Design System

### Colors & Theme
- **Primary**: Blue gradient (blue-500 to purple-600)
- **Status Colors**: Green (success), Red (error), Yellow (warning), Blue (info)
- **Dark Mode**: Full dark theme support with CSS variables

### Components
- **Cards**: Clean, modern card layouts with hover states
- **Badges**: Status indicators with semantic colors
- **Buttons**: Multiple variants (primary, secondary, ghost, outline)
- **Forms**: Consistent input styling with focus states

### Typography
- **Font**: Inter (clean, modern sans-serif)
- **Hierarchy**: Clear heading levels with appropriate spacing
- **Code**: Monospace font for technical content

## Integration Points

### Backend Integration
The frontend is designed to easily integrate with your Stagehand backend:

1. **API Endpoints**: Replace mock data with real API calls
2. **WebSocket**: Real-time updates for running tasks
3. **Authentication**: User management and session handling
4. **File Upload**: Log file import and export functionality

### Example API Integration
```typescript
// Replace mock data with real API calls
const fetchTasks = async () => {
  const response = await fetch('/api/tasks')
  return response.json()
}

// WebSocket for real-time updates
const ws = new WebSocket('ws://localhost:8080/realtime')
ws.onmessage = (event) => {
  const update = JSON.parse(event.data)
  // Update UI with real-time data
}
```

## Customization

### Branding
- Update logo and colors in `src/components/layout/sidebar.tsx`
- Modify theme colors in `tailwind.config.js`
- Update application name in `src/app/layout.tsx`

### Features
- Add new pages by creating files in `src/app/`
- Extend monitoring with custom tools in `src/components/monitoring/`
- Add new data types in `src/types/index.ts`

## Development

### Code Style
- **ESLint**: Configured with Next.js recommended rules
- **TypeScript**: Strict mode enabled for type safety
- **Prettier**: Consistent code formatting (add .prettierrc if needed)

### Testing
```bash
# Add your testing framework of choice
pnpm add -D jest @testing-library/react
```

### Deployment
The application is ready for deployment on:
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Docker**: Container-ready setup
- **Self-hosted**: Standard Node.js deployment

## Performance

### Optimization Features
- **Next.js App Router**: Automatic code splitting and optimization
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Use `pnpm build && pnpm analyze` (after adding bundle analyzer)
- **Lazy Loading**: Components loaded on demand

### Performance Tips
- Mock data is used for development - replace with proper data fetching
- Implement pagination for large datasets
- Add caching for frequently accessed data
- Use React.memo for expensive components

## Contributing

1. **Code Organization**: Follow the established folder structure
2. **Component Design**: Create reusable, composable components
3. **Type Safety**: Maintain full TypeScript coverage
4. **Accessibility**: Follow WCAG guidelines for UI components
5. **Documentation**: Update README for new features

## License

This frontend application is part of the Circular project and follows the same licensing as the parent project.

## Support

For questions, issues, or feature requests related to the frontend:
1. Check existing documentation
2. Review component examples in the codebase
3. Create issues for bugs or feature requests
4. Follow the established patterns for consistency
