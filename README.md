# Comment App Frontend

A modern, responsive React TypeScript frontend for a threaded comment system with JWT cookie-based authentication.

## Features

- 🔐 **JWT Cookie Authentication** - Secure session management without localStorage
- 💬 **Threaded Comments** - Instagram/Reddit-style nested comment system
- ✏️ **Inline Editing** - Edit and reply to comments without page navigation
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🔄 **Real-time Updates** - Optimistic updates and automatic refresh
- ⏰ **Time-limited Editing** - 15-minute edit window with visual indicators
- 🗑️ **Soft Delete/Restore** - Grace period for comment recovery

## Architecture

### Folder Structure
```
src/
├── api/           # API layer (axios instances, auth, comments)
├── components/    # Reusable UI components
├── context/       # React context providers
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── index.css      # Global styles and utilities
```

### Key Components

- **CommentThread** - Recursive component for threaded comments
- **CommentCard** - Individual comment with actions and state
- **InlineCommentInput** - Inline form for creating/editing comments
- **AuthForm** - Unified login/register form component

### API Layer

- **api/api.ts** - Axios instance with cookie configuration
- **api/auth.ts** - Authentication endpoints
- **api/comments.ts** - Comment CRUD operations

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Backend Integration

This frontend expects a NestJS backend with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Comments
- `GET /comments` - Get paginated comments
- `POST /comments` - Create comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `POST /comments/:id/restore` - Restore deleted comment
- `GET /comments/:id/tree` - Get comment with replies
- `GET /comments/:id/replies` - Get comment replies

## Features in Detail

### Authentication
- Cookie-based JWT tokens
- Automatic session restoration
- Protected routes with loading states
- Clean login/register forms

### Comment System
- Infinite nesting support with visual depth indicators
- Collapsible/expandable comment threads
- Inline editing with auto-resize textarea
- Time-limited editing (15 minutes)
- Soft delete with restore functionality
- Pagination with "Load More" button

### UI/UX
- Mobile-first responsive design
- Smooth animations and transitions
- Loading states and error handling
- Keyboard shortcuts (Cmd+Enter to submit, Esc to cancel)
- Auto-focus and cursor positioning
- Visual feedback for all interactions

## Technologies

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **date-fns** for date formatting
- **Lucide React** for icons

## Development Notes

- All API calls are centralized in the `api/` directory
- Components follow single responsibility principle
- Proper TypeScript typing throughout
- Mobile-first responsive design
- Clean separation of concerns
- Error boundaries and loading states
- Optimistic updates for better UX

## Production Considerations

- Environment variable configuration
- Error boundary implementation
- Performance optimization with React.memo
- Bundle size optimization
- SEO considerations
- Accessibility compliance
- Security headers and CORS configuration