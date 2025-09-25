# College Application Dashboard Design Guidelines

## Design Approach
**Selected Approach**: Design System (Utility-Focused)
**System**: Material Design with custom adaptations
**Justification**: This is a productivity tool requiring efficiency, learnability, and clear information hierarchy. Users need to focus on content creation and organization rather than visual distractions.

## Core Design Elements

### Color Palette
**Light Mode:**
- Primary: 220 100% 50% (Blue)
- Surface: 0 0% 98% (Light Gray)
- Background: 0 0% 100% (White)
- Text Primary: 220 20% 15% (Dark Blue-Gray)
- Text Secondary: 220 15% 45% (Medium Gray)
- Success: 142 76% 36% (Green)
- Warning: 45 100% 51% (Orange)

**Dark Mode:**
- Primary: 220 100% 60% (Lighter Blue)
- Surface: 220 20% 12% (Dark Blue-Gray)
- Background: 220 20% 8% (Very Dark Blue)
- Text Primary: 0 0% 95% (Off White)
- Text Secondary: 220 15% 70% (Light Gray)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Secondary Font**: JetBrains Mono (for code/technical elements)
- **Headings**: 600-700 weight, sizes from text-xl to text-3xl
- **Body**: 400-500 weight, text-sm to text-base
- **Captions**: 400 weight, text-xs

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Micro spacing: p-2, m-2
- Standard spacing: p-4, m-4, gap-4
- Section spacing: p-6, m-6
- Large spacing: p-8, m-8

### Component Library

#### Navigation
- **Sidebar Navigation**: Fixed left sidebar with icon + text navigation items
- **Breadcrumbs**: Clear navigation hierarchy for essay organization
- **Tab Navigation**: For switching between essay types (Common App, College-specific)

#### Data Input & Display
- **Rich Text Editor**: Clean toolbar with essential formatting options (bold, italic, underline, bullet points)
- **AI Chat Interface**: Right sidebar with message bubbles, input field, and scrollable history
- **Essay Cards**: Clean card design showing essay title, college, word count, and last modified
- **Progress Indicators**: Visual bars for essay feedback scores (flow, hook, voice, uniqueness)

#### Interactive Elements
- **AI Edit Suggestions**: Inline highlighting with Keep/Undo buttons styled as small, rounded chips
- **Feedback Panel**: Expandable card showing statistics and detailed paragraph feedback
- **Action Buttons**: Primary (solid blue), Secondary (outline), and Destructive (red outline) variants

#### Forms & Inputs
- **Text Inputs**: Clean borders with focus states, consistent with dark mode
- **Dropdowns**: College selection and essay type categorization
- **ECA Management**: Add/edit forms with drag-and-drop reordering capability

### Animations
**Minimal Implementation**:
- Subtle hover states on interactive elements
- Smooth page transitions (300ms ease-in-out)
- AI suggestion appearance with gentle fade-in
- Loading states for AI processing

### Content Organization
- **Dashboard Grid**: 3-column layout (Navigation | Main Content | AI Assistant)
- **Essay Management**: List view with filtering and search capabilities
- **ECA Section**: Card-based layout for activity entries with AI refinement suggestions

### Visual Hierarchy
- Clear distinction between primary actions (essay creation/editing) and secondary actions (organization, settings)
- Consistent iconography using Heroicons
- Generous whitespace to reduce cognitive load
- Strategic use of color for status indicators and feedback scores

This design prioritizes functionality and user efficiency while maintaining a professional, academic aesthetic appropriate for college application management.