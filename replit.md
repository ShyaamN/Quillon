# Quillon - AI-Powered College Application Assistant

## Overview

Quillon is a comprehensive college application management platform that helps students write compelling essays, manage extracurricular activities, and optimize their application materials with AI assistance. The application features a rich text editor for essay composition, AI-powered feedback and suggestions, extracurricular activity tracking, and application progress monitoring across multiple colleges.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with Tailwind CSS for consistent, accessible design
- **Component System**: shadcn/ui design system following Material Design principles with custom adaptations
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Styling**: Tailwind CSS with custom design tokens supporting both light and dark modes

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints for essays, extracurricular activities, and user management
- **Storage Interface**: Abstract IStorage interface with in-memory implementation (MemStorage) for development
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Management**: Centralized schema definitions in shared directory for type consistency
- **Migration System**: Drizzle Kit for database schema migrations and version control

### AI Integration
- **Provider**: Google Gemini AI (gemini-2.5-flash model) for natural language processing
- **Features**: Essay analysis and feedback, content suggestions, editing recommendations, and extracurricular activity refinement
- **API Design**: Structured interfaces for AI responses with error handling and rate limiting considerations

### Authentication & Security
- **Session-based Authentication**: Express sessions with PostgreSQL backing store
- **Password Security**: Secure password hashing and validation
- **API Security**: Request validation using Zod schemas and proper error handling

### Development & Build System
- **Build Tool**: Vite for fast development and optimized production builds
- **Development Features**: Hot module replacement, runtime error overlays, and Replit integration
- **Code Quality**: TypeScript strict mode, ESLint configuration, and consistent formatting
- **Asset Management**: Organized asset structure with proper aliasing for imports

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI provider for essay analysis, feedback generation, and content suggestions
- **API Key Management**: Environment-based configuration with graceful fallbacks

### Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Environment Configuration**: Database URL and credentials managed via environment variables

### UI & Styling
- **Google Fonts**: Inter for primary typography, JetBrains Mono for technical elements
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration

### Development Tools
- **Replit Integration**: Development environment optimizations and deployment features
- **Vite Plugins**: Runtime error handling, cartographer for development, and React fast refresh

### Third-party Libraries
- **React Hook Form**: Form state management with validation
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe component variant management
- **Wouter**: Lightweight routing solution for single-page applications