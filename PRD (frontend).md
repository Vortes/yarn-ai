# InsightSpark: Frontend MVP Development Guide

**Version:** 1.0
**Date:** June 1, 2025
**Based on:** AI MVP Development Guide v1.0

## 1. Overview

This document outlines the frontend development plan for InsightSpark's MVP, focusing solely on the chat interface as the primary view. The design should follow Notion/Linear simplicity principles with a ChatGPT-style layout, prioritizing mobile-first design with a professional aesthetic similar to v0's styling.

## 2. Technology Stack

- **Framework:** Next.js with TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui components
- **State Management:** React hooks + tRPC for server state
- **Authentication:** Clerk
- **Audio Recording:** Web Audio API / MediaRecorder
- **File Upload:** UploadThing integration

## 3. Core Layout Structure

### 3.1. Main Chat Interface Layout

\`\`\`
InsightSpark Layout: ChatGPT-Style Interface
The wireframe shows a classic ChatGPT-style layout for InsightSpark with four main sections:

1. Header Section
   Spans the full width at the top of the interface
   Contains three key elements:

Logo: Brand identification (likely "InsightSpark")
Session Counter: Shows remaining free sessions or premium status
Profile: User account access/sign-up button

2. Sessions Sidebar (Left)
   Narrow vertical panel on the left side
   Will display previous conversation history
   Functions similar to ChatGPT's conversation list
   Allows users to navigate between different recording sessions
   On mobile, likely collapses behind a hamburger menu
3. Chat Messages Area (Center/Main)
   Primary content area occupying most of the interface
   Shows the conversation thread between user and AI
   Contains structured message types:

AI Summary + Questions: Initial response after audio processing
User Response: Text or transcribed audio replies
AI Follow-up: Further questions based on framework
...: Indicating the conversation continues

Messages appear in chronological order, scrolling vertically
Each message has visual distinction between AI vs user 4. Input Area (Bottom)
Fixed at the bottom of the interface
Combines two key input mechanisms:

Audio/Text Input: Recording button and text field
Framework Selector: Dropdown to select therapeutic approach

Likely sticky position to remain accessible while scrolling
This layout follows established chat interface patterns, making it immediately familiar to users while supporting InsightSpark's unique audio-first, therapeutic conversation approach. The sidebar adds navigation capabilities while keeping the main focus on the conversation itself.
\`\`\`

### 3.2. Mobile-First Responsive Behavior

- **Mobile:** Sidebar collapses to hamburger menu
- **Tablet/Desktop:** Sidebar always visible
- **Input area:** Sticks to bottom on mobile

## 4. Development Phases

### Phase 1: Core Chat Interface (Frontend v0.1)

**Goal:** Create the basic chat layout with message display and input handling.

**Components to Build:**

1. **MainChatLayout** (`components/chat/main-chat-layout.tsx`)
   \`\`\`tsx
   interface MainChatLayoutProps {
   children: React.ReactNode;
   }
   \`\`\`

   - Header with logo, session counter, profile picture
   - Responsive sidebar for session history
   - Main chat area container

2. **ChatMessage** (`components/chat/chat-message.tsx`)
   \`\`\`tsx
   interface ChatMessageProps {
   type: 'user' | 'ai';
   content: string | AIResponse;
   timestamp: Date;
   isLoading?: boolean;
   }

   interface AIResponse {
   summary?: string;
   questions?: string[];
   outline?: ContentOutline;
   }
   \`\`\`

   - Separate bubbles for user and AI messages
   - AI messages can contain summary + questions as separate visual sections
   - Loading states with step-by-step status

3. **ChatInput** (`components/chat/chat-input.tsx`)
   \`\`\`tsx
   interface ChatInputProps {
   onSendMessage: (message: string) => void;
   onSendAudio: (audioBlob: Blob) => void;
   disabled?: boolean;
   }
   \`\`\`
   - Default state: Floating audio button + text area option toggle
   - Therapeutic framework selector (dropdown/select)
   - Input mode switching (audio ↔ text)

**Acceptance Criteria:**

- Chat interface renders correctly on mobile and desktop
- Messages display in proper bubbles with timestamps
- Input area allows switching between audio and text modes
- Framework selector is accessible before sending

---

### Phase 2: Audio Recording & File Upload (Frontend v0.2)

**Goal:** Implement audio recording with waveform visualization and file upload.

**Components to Build:**

1. **AudioRecorder** (`components/audio/audio-recorder.tsx`)
   \`\`\`tsx
   interface AudioRecorderProps {
   onRecordingComplete: (audioBlob: Blob) => void;
   maxDuration: number; // 5 or 10 minutes based on user tier
   onTimeWarning: (remainingSeconds: number) => void;
   }
   \`\`\`

   - Floating record button (default state)
   - Expanded state: timer, waveform, stop/pause controls
   - Toast notifications for time warnings
   - Auto-stop at time limit

2. **WaveformVisualizer** (`components/audio/waveform-visualizer.tsx`)
   \`\`\`tsx
   interface WaveformVisualizerProps {
   audioStream: MediaStream;
   isRecording: boolean;
   }
   \`\`\`

   - Real-time waveform display during recording
   - Clean, minimal design matching overall aesthetic

3. **FileUploadZone** (`components/audio/file-upload-zone.tsx`)
   \`\`\`tsx
   interface FileUploadZoneProps {
   onFileSelect: (file: File) => void;
   maxFileSize: number;
   acceptedFormats: string[];
   }
   \`\`\`
   - Drag and drop interface
   - File validation and error handling
   - Progress indicator during upload

**Acceptance Criteria:**

- Audio recording works on mobile and desktop browsers
- Waveform displays in real-time during recording
- File upload supports drag-and-drop with progress indication
- Time warnings appear as toast notifications

---

### Phase 3: AI Integration & Response Handling (Frontend v0.3)

**Goal:** Connect frontend to AI backend and handle all response types.

**Components to Build:**

1. **AIResponseRenderer** (`components/chat/ai-response-renderer.tsx`)
   \`\`\`tsx
   interface AIResponseRendererProps {
   response: AIResponse;
   onQuestionSelect?: (question: string) => void;
   }
   \`\`\`

   - Renders summary in one bubble
   - Renders questions as numbered list in separate bubble
   - Questions can be clickable to auto-fill user response

2. **ProcessingIndicator** (`components/chat/processing-indicator.tsx`)
   \`\`\`tsx
   interface ProcessingIndicatorProps {
   steps: ProcessingStep[];
   currentStep: number;
   }

   interface ProcessingStep {
   label: string;
   status: 'pending' | 'active' | 'complete';
   }
   \`\`\`

   - Step-by-step status for AI processing
   - Steps: "Transcribing audio" → "Analyzing content" → "Generating questions"

3. **ContentOutlineDisplay** (`components/chat/content-outline-display.tsx`)
   \`\`\`tsx
   interface ContentOutlineDisplayProps {
   outline: ContentOutline;
   onEdit: (editedOutline: ContentOutline) => void;
   onExport: (format: 'pdf' | 'txt' | 'md') => void;
   }
   \`\`\`
   - Displays outline in structured format
   - Inline editing capabilities
   - Export buttons for different formats

**Acceptance Criteria:**

- AI responses render correctly with proper formatting
- Processing indicators show real-time status
- Content outlines are editable and exportable
- Error states are handled gracefully

---

### Phase 4: Anonymous User Flow & Session Management (Frontend v0.4)

**Goal:** Implement anonymous user experience and session persistence.

**Components to Build:**

1. **AnonymousUserBanner** (`components/auth/anonymous-user-banner.tsx`)
   \`\`\`tsx
   interface AnonymousUserBannerProps {
   onSignUp: () => void;
   sessionsRemaining: number;
   }
   \`\`\`

   - Inline banner after first session completion
   - Clear messaging about signup benefits
   - Non-intrusive but visible

2. **SessionSidebar** (`components/chat/session-sidebar.tsx`)
   \`\`\`tsx
   interface SessionSidebarProps {
   sessions: ChatSession[];
   currentSessionId: string;
   onSessionSelect: (sessionId: string) => void;
   onNewSession: () => void;
   }
   \`\`\`

   - List of previous sessions with titles
   - Current session highlighting
   - New session button

3. **SessionCounter** (`components/ui/session-counter.tsx`)
   \`\`\`tsx
   interface SessionCounterProps {
   used: number;
   total: number;
   tier: 'anonymous' | 'free' | 'premium';
   }
   \`\`\`
   - Shows remaining sessions for current month
   - Different styling based on user tier

**Acceptance Criteria:**

- Anonymous users see appropriate prompts after first session
- Session data persists across page refreshes
- Session sidebar shows history and allows navigation
- Session counter accurately reflects usage

---

### Phase 5: Mobile Optimization & Polish (Frontend v0.5)

**Goal:** Ensure excellent mobile experience and final polish.

**Components to Build:**

1. **MobileNavigation** (`components/layout/mobile-navigation.tsx`)

   - Hamburger menu for session sidebar
   - Optimized touch targets
   - Swipe gestures for navigation

2. **MobileAudioControls** (`components/audio/mobile-audio-controls.tsx`)
   - Touch-optimized recording controls
   - Haptic feedback integration
   - Improved mobile recording UX

**Mobile-Specific Optimizations:**

- Touch-friendly button sizes (minimum 44px)
- Optimized keyboard behavior for text input
- Proper viewport handling
- iOS Safari audio recording compatibility
- Android Chrome audio permissions

**Acceptance Criteria:**

- Excellent mobile experience across iOS and Android
- Audio recording works reliably on mobile browsers
- Touch interactions feel natural and responsive
- No horizontal scrolling on any screen size

## 5. Design System & Styling Guidelines

### 5.1. Color Palette (Professional v0-inspired)

\`\`\`css
:root {
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--muted: 210 40% 98%;
--muted-foreground: 215.4 16.3% 46.9%;
--border: 214.3 31.8% 91.4%;
--accent: 210 40% 98%;
--accent-foreground: 222.2 84% 4.9%;
}
\`\`\`

### 5.2. Typography

- **Headers:** Inter/System font, clean and minimal
- **Body:** Consistent with v0 styling
- **Code/Technical:** Monospace for any technical elements

### 5.3. Component Patterns

- Use shadcn/ui components as base
- Consistent spacing using Tailwind's spacing scale
- Subtle shadows and borders
- Professional, clean aesthetic

## 6. State Management Strategy

### 6.1. Chat State

\`\`\`tsx
interface ChatState {
messages: ChatMessage[];
currentSession: string;
isProcessing: boolean;
processingStep: ProcessingStep;
selectedFramework: TherapeuticFramework;
}
\`\`\`

### 6.2. User State

\`\`\`tsx
interface UserState {
isAnonymous: boolean;
sessionsUsed: number;
sessionLimit: number;
tier: UserTier;
}
\`\`\`

### 6.3. Audio State

\`\`\`tsx
interface AudioState {
isRecording: boolean;
recordingDuration: number;
audioBlob?: Blob;
isUploading: boolean;
}
\`\`\`

## 7. Performance Considerations

- **Lazy loading:** Load session history on demand
- **Audio optimization:** Compress audio before upload
- **Message virtualization:** For long conversations
- **Debounced inputs:** For text responses
- **Optimistic updates:** Show user messages immediately

## 8. Accessibility Requirements

- **Keyboard navigation:** Full keyboard support
- **Screen readers:** Proper ARIA labels
- **Audio alternatives:** Visual indicators for audio states
- **Color contrast:** WCAG AA compliance
- **Focus management:** Clear focus indicators

This phased approach ensures a solid foundation while building incrementally toward a polished MVP that works excellently on mobile devices.
\`\`\`

This development guide should give your frontend developers everything they need to build the chat interface MVP. The mobile-first approach and professional styling will create a clean, usable experience that matches your vision.
