# SkooledIn - AI-Powered Education Platform

A Progressive Web App (PWA) built with Vite, React, TypeScript, and Tailwind CSS, featuring WhatsApp-inspired UI/UX patterns for an intuitive educational experience.

## 🚀 Features

### Core Features
- **WhatsApp-Style UI**: Familiar chat list interface for assignments and announcements
- **Swipeable Actions**: Archive and mark items as read with swipe gestures
- **AI Chat Interface**: Message bubble UI for natural AI tutoring conversations
- **Responsive Design**: Mobile-first with enhanced desktop layouts
- **PWA Capabilities**: Installable app with offline support
- **Role-Based Experience**: Customized interfaces for students, teachers, and parents

### User Types
1. **Students**: Access assignments, AI tutoring, and personal notebook
2. **Teachers**: Create content, manage classrooms, track progress
3. **Parents**: Monitor children's education and find resources

## 🛠️ Tech Stack

- **Build Tool**: Vite 5.0
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Routing**: React Router v6
- **PWA**: vite-plugin-pwa
- **UI Components**: Custom components with Lucide icons
- **Animations**: Framer Motion

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd skooledin-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Button, Input, Card, etc.
│   ├── layout/      # AppShell, Navigation
│   ├── feed/        # Feed-specific components
│   ├── chat/        # Chat UI components
│   └── context/     # Context switching
├── pages/           # Route pages
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: #7c3aed (Purple)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1279px
- Desktop: ≥ 1280px

## 🚀 Running the App

### Development
```bash
npm run dev
```
Access at http://localhost:5173

### Build for Production
```bash
npm run build
npm run preview
```

### Type Checking
```bash
npm run type-check
```

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker caching
- **Auto Updates**: Prompt users when new version available
- **App-like Experience**: Full screen, custom theme color

## 🔐 Authentication

Demo credentials:
- Student: student@demo.com / demo123
- Teacher: teacher@demo.com / demo123
- Parent: parent@demo.com / demo123

## 📋 Key Components

### WhatsApp-Style Feed
- Swipeable cards for actions
- Chat list appearance
- Time-based sorting
- Unread indicators

### AI Chat Interface
- Message bubbles
- Typing indicators
- Voice note UI (planned)
- File attachments

### Context Switching
- Subject/class filtering
- Persistent selection
- Quick switching UI

## 🔄 State Management

Using Zustand for global state:
- `authStore`: User authentication and profile
- `contextStore`: Current subject/class context
- `feedStore`: Feed items and filters
- `chatStore`: AI chat sessions

## 🎯 Future Enhancements

- [ ] Real-time updates with WebSockets
- [ ] Voice message support
- [ ] Video call integration
- [ ] Advanced AI features
- [ ] Multi-language support
- [ ] Dark mode

## 📄 License

MIT License - See LICENSE file for details
